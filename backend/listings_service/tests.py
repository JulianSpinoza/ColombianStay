from unittest.mock import patch
from urllib.parse import urlparse

from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.db.models import Max
from django.test import TestCase, override_settings
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files.storage import default_storage
from django.contrib.gis.geos import Point, Polygon, MultiPolygon
from rest_framework import status
from rest_framework.test import APITestCase, APITransactionTestCase, APIRequestFactory

from PIL import Image

from listings_service.models import Listing, ListingImage, Region, Department, Municipality
from listings_service.serializers import PublishListingSerializer, ListingImageSerializer

import tempfile
import io
import json

User = get_user_model()


def create_test_user(**kwargs):
    """
    Crea usuarios sin depender del estado de la secuencia de PostgreSQL.
    Algunos tests/fixtures pueden dejar la secuencia desincronizada aunque ya exista id=1.
    """
    next_id = (User.objects.aggregate(max_id=Max("id"))["max_id"] or 0) + 1
    kwargs.setdefault("id", next_id)
    return User.objects.create_user(**kwargs)


def generate_test_image(image_format="JPEG"):
    file = io.BytesIO()
    image = Image.new("RGB", (100, 100))
    image.save(file, image_format)
    file.seek(0)
    return file


def make_uploaded_image(name="test_image.jpg", content_type="image/jpeg"):
    return SimpleUploadedFile(
        name=name,
        content=generate_test_image().read(),
        content_type=content_type,
    )


class DummySignedRequest:
    def __init__(self, user):
        self.user = user


class BaseListingTestMixin:
    @classmethod
    def create_test_municipality(cls):
        region = Region.objects.create(name="Región de prueba")
        department = Department.objects.create(
            region=region,
            name="Departamento de prueba",
        )
        polygon = Polygon((
            (-76.50, 5.80),
            (-76.40, 5.80),
            (-76.40, 5.90),
            (-76.50, 5.90),
            (-76.50, 5.80),
        ), srid=4326)

        return Municipality.objects.create(
            department=department,
            name="Municipio de prueba",
            boundary=MultiPolygon(polygon, srid=4326),
        )

    @classmethod
    def get_existing_municipality(cls):
        municipality = Municipality.objects.order_by("pk").first()
        if municipality is not None:
            return municipality

        return cls.create_test_municipality()

    @classmethod
    def get_valid_point_for_municipality(cls, municipality):
        point = municipality.boundary.point_on_surface
        return Point(point.x, point.y, srid=municipality.boundary.srid or 4326)

    def get_valid_point(self):
        return self.get_valid_point_for_municipality(self.municipality)

    def get_valid_location(self):
        point = self.get_valid_point()
        return {
            "lat": point.y,
            "lng": point.x,
        }

    def get_alternate_valid_location(self):
        point = self.get_valid_point()
        return {
            "lat": point.y + 0.00001,
            "lng": point.x + 0.00001,
        }

    def get_valid_payload(self):
        return {
            "municipality": self.municipality.pk,
            "title": "Apartamento amplio",
            "description": "Apartamento amplio, cómodo y muy bien ubicado.",
            "bedrooms": 2,
            "bathrooms": 1,
            "locationdesc": "Muy cerca al parque principal y transporte público.",
            "addresstext": "Calle 123 #45-67",
            "propertytype": "apartment",
            "pricepernight": 120000,
            "maxguests": 3,
            "exactlocation": self.get_valid_location(),
        }

    def get_valid_multipart_payload(self):
        payload = self.get_valid_payload()
        payload["exactlocation"] = json.dumps(payload["exactlocation"])
        return payload

    def get_valid_publish_payload(self):
        payload = self.get_valid_payload()
        payload["images"] = [make_uploaded_image("publish_image.jpg")]
        return payload

    def get_valid_publish_multipart_payload(self):
        payload = self.get_valid_multipart_payload()
        payload["images"] = [make_uploaded_image("publish_image.jpg")]
        return payload

    def create_listing(self, owner=None, **overrides):
        data = {
            "owner": owner or self.user,
            "municipality": self.municipality,
            "title": "Apartamento original",
            "description": "Descripción original suficientemente larga.",
            "bedrooms": 1,
            "bathrooms": 1,
            "locationdesc": "Ubicación original suficientemente larga.",
            "addresstext": "Calle original #1-2",
            "propertytype": "apartment",
            "pricepernight": 100000,
            "maxguests": 2,
            "exactlocation": self.get_valid_point(),
        }
        data.update(overrides)
        return Listing.objects.create(**data)


class PublishListingSerializerTests(BaseListingTestMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = create_test_user(
            username="serializer_user",
            email="serializer@test.com",
            password="secret123",
            is_host=False,
        )
        cls.municipality = cls.get_existing_municipality()

    def test_serializer_accepts_valid_payload(self):
        serializer = PublishListingSerializer(
            data=self.get_valid_publish_payload(),
            context={"request": DummySignedRequest(self.user)},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_rejects_when_maxguests_is_less_than_bedrooms(self):
        data = self.get_valid_publish_payload()
        data["bedrooms"] = 4
        data["maxguests"] = 2

        serializer = PublishListingSerializer(
            data=data,
            context={"request": DummySignedRequest(self.user)},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("maxguests", serializer.errors)

    def test_rejects_when_title_equals_description(self):
        data = self.get_valid_publish_payload()
        data["title"] = "Mismo texto"
        data["description"] = "Mismo texto"

        serializer = PublishListingSerializer(
            data=data,
            context={"request": DummySignedRequest(self.user)},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("description", serializer.errors)

    def test_rejects_duplicate_listing_for_same_user(self):
        self.create_listing(
            title="Apartamento amplio",
            description="Descripción suficientemente larga para el registro.",
            bedrooms=2,
            bathrooms=1,
            locationdesc="Ubicación válida con longitud suficiente.",
            addresstext="Calle 123 #45-67",
            propertytype="apartment",
            pricepernight=120000,
            maxguests=3,
        )

        serializer = PublishListingSerializer(
            data=self.get_valid_publish_payload(),
            context={"request": DummySignedRequest(self.user)},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)

    def test_allows_same_title_and_address_for_different_user(self):
        other_user = create_test_user(
            username="other_user",
            email="other@test.com",
            password="secret123",
            is_host=False,
        )

        self.create_listing(
            owner=other_user,
            title="Apartamento amplio",
            description="Descripción suficientemente larga para el registro.",
            bedrooms=2,
            bathrooms=1,
            locationdesc="Ubicación válida con longitud suficiente.",
            addresstext="Calle 123 #45-67",
            propertytype="apartment",
            pricepernight=120000,
            maxguests=3,
        )

        serializer = PublishListingSerializer(
            data=self.get_valid_publish_payload(),
            context={"request": DummySignedRequest(self.user)},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class PublishPropertyAPITests(BaseListingTestMixin, APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = create_test_user(
            username="api_user",
            email="api@test.com",
            password="secret123",
            is_host=False,
        )
        cls.municipality = cls.get_existing_municipality()
        cls.url = reverse("publish-property")

    def test_requires_authentication(self):
        response = self.client.post(
            self.url,
            self.get_valid_publish_multipart_payload(),
            format="multipart",
        )

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

    def test_create_property_successfully(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            self.get_valid_publish_multipart_payload(),
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Listing.objects.filter(owner=self.user).count(), 1)

        listing = Listing.objects.get(
            owner=self.user,
            title="Apartamento amplio",
        )

        self.assertEqual(listing.owner, self.user)
        self.assertEqual(listing.municipality, self.municipality)
        self.assertEqual(listing.title, "Apartamento amplio")
        self.assertEqual(listing.images.count(), 1)
    
    def test_sets_user_as_host_when_property_is_created(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            self.get_valid_publish_multipart_payload(),
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.user.refresh_from_db()
        self.assertTrue(self.user.is_host)

    def test_rejects_invalid_municipality(self):
        self.client.force_authenticate(user=self.user)
        payload = self.get_valid_publish_multipart_payload()
        payload["municipality"] = 99999999

        response = self.client.post(self.url, payload, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("municipality", response.data)

    def test_rejects_duplicate_listing_for_same_user(self):
        self.client.force_authenticate(user=self.user)

        first_response = self.client.post(
            self.url,
            self.get_valid_publish_multipart_payload(),
            format="multipart",
        )
        second_response = self.client.post(
            self.url,
            self.get_valid_publish_multipart_payload(),
            format="multipart",
        )

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            Listing.objects.filter(
                owner=self.user,
                title="Apartamento amplio",
                addresstext="Calle 123 #45-67",
            ).count(),
            1,
        )

    def test_owner_in_payload_is_ignored(self):
        self.client.force_authenticate(user=self.user)
        payload = self.get_valid_publish_multipart_payload()
        payload["owner"] = 999999

        response = self.client.post(self.url, payload, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        listing = Listing.objects.get(
            owner=self.user,
            title="Apartamento amplio",
        )

        self.assertEqual(listing.owner, self.user)

    def test_allows_same_title_and_address_for_different_user(self):
        self.client.force_authenticate(user=self.user)

        first_response = self.client.post(
            self.url,
            self.get_valid_publish_multipart_payload(),
            format="multipart",
        )
        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)

        other_user = create_test_user(
            username="second_api_user",
            email="second-api@test.com",
            password="secret123",
            is_host=False,
        )

        self.client.force_authenticate(user=other_user)

        second_response = self.client.post(
            self.url,
            self.get_valid_publish_multipart_payload(),
            format="multipart",
        )

        self.assertEqual(second_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            Listing.objects.filter(
                title="Apartamento amplio",
                addresstext="Calle 123 #45-67",
            ).count(),
            2,
        )

class PublishPropertyTransactionTests(BaseListingTestMixin, APITransactionTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("publish-property")

    def setUp(self):
        self.user = create_test_user(
            username="transaction_user",
            email="transaction@test.com",
            password="secret123",
            is_host=False,
        )
        self.municipality = self.get_existing_municipality()

    def test_rollback_if_user_update_fails_after_listing_creation(self):
        self.client.force_authenticate(user=self.user)

        original_save = self.user.save

        def failing_save(*args, **kwargs):
            update_fields = kwargs.get("update_fields")
            if update_fields == ["is_host"]:
                raise Exception("Simulated user save failure")
            return original_save(*args, **kwargs)

        with patch.object(self.user, "save", side_effect=failing_save):
            with self.assertRaises(Exception):
                self.client.post(
                    self.url,
                    self.get_valid_publish_multipart_payload(),
                    format="multipart",
                )

        self.assertFalse(
            Listing.objects.filter(
                owner=self.user,
                title="Apartamento amplio",
                addresstext="Calle 123 #45-67",
            ).exists()
        )

        self.user.refresh_from_db()
        self.assertFalse(self.user.is_host)

    def test_serializer_rejects_duplicate_listing_for_same_user(self):
        self.create_listing(
            title="Apartamento amplio",
            description="Descripción suficientemente larga para el registro.",
            bedrooms=2,
            bathrooms=1,
            locationdesc="Ubicación válida con longitud suficiente.",
            addresstext="Calle 123 #45-67",
            propertytype="apartment",
            pricepernight=120000,
            maxguests=3,
        )

        serializer = PublishListingSerializer(
            data=self.get_valid_publish_payload(),
            context={"request": DummySignedRequest(self.user)},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)

@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ListingImageModelTest(BaseListingTestMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.municipality = cls.get_existing_municipality()

        cls.user = create_test_user(
            username="image_model_user",
            email="image-model@test.com",
            password="secret123",
            is_host=False,
        )

        cls.listing = Listing.objects.create(
            owner=cls.user,
            municipality=cls.municipality,
            title="Apartamento amplio",
            description="Descripción suficientemente larga para el registro.",
            bedrooms=2,
            bathrooms=1,
            locationdesc="Ubicación válida con longitud suficiente.",
            addresstext="Calle 123 #45-67",
            propertytype="apartment",
            pricepernight=120000,
            maxguests=3,
            exactlocation=cls.get_valid_point_for_municipality(cls.municipality),
        )

    def test_create_listing_image_and_thumbnail(self):
        listing_image = ListingImage.objects.create(
            listing=self.listing,
            image=make_uploaded_image("test_image.jpg"),
            is_main=True,
        )

        self.assertIsNotNone(listing_image.id)
        self.assertTrue(listing_image.image)
        self.assertTrue(listing_image.thumbnail)

    def test_unique_main_image(self):
        ListingImage.objects.create(
            listing=self.listing,
            image=make_uploaded_image("img1.jpg"),
            is_main=True,
        )

        with self.assertRaises(IntegrityError):
            ListingImage.objects.create(
                listing=self.listing,
                image=make_uploaded_image("img2.jpg"),
                is_main=True,
            )

    def test_image_url_returns_file(self):
        listing_image = ListingImage.objects.create(
            listing=self.listing,
            image=make_uploaded_image("test_image.jpg"),
        )

        self.assertTrue(default_storage.exists(listing_image.image.name))

        listing_image_is_main = ListingImage.objects.create(
            listing=self.listing,
            image=make_uploaded_image("main_test_image.jpg"),
            is_main=True,
        )

        self.assertTrue(default_storage.exists(listing_image_is_main.image.name))
        self.assertTrue(default_storage.exists(listing_image_is_main.thumbnail.name))


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ListingImageSerializerTest(BaseListingTestMixin, APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.municipality = cls.get_existing_municipality()

        cls.user = create_test_user(
            username="image_serializer_user",
            email="image-serializer@test.com",
            password="secret123",
            is_host=False,
        )

        cls.listing = Listing.objects.create(
            owner=cls.user,
            municipality=cls.municipality,
            title="Apartamento amplio",
            description="Descripción suficientemente larga para el registro.",
            bedrooms=2,
            bathrooms=1,
            locationdesc="Ubicación válida con longitud suficiente.",
            addresstext="Calle 123 #45-67",
            propertytype="apartment",
            pricepernight=120000,
            maxguests=3,
            exactlocation=cls.get_valid_point_for_municipality(cls.municipality),
        )

        cls.image = ListingImage.objects.create(
            listing=cls.listing,
            image=make_uploaded_image("test.jpg"),
        )

    def test_serializer_fields(self):
        factory = APIRequestFactory()
        request = factory.get("/")

        serializer = ListingImageSerializer(
            self.image,
            context={"request": request},
        )

        data = serializer.data

        self.assertIn("image_url", data)
        self.assertIn("thumbnail_url", data)
        self.assertEqual(data["is_main"], False)
        self.assertNotIn("accomodationid", data)

    def test_serializer_url_is_accessible(self):
        factory = APIRequestFactory()
        request = factory.get("/")

        serializer = ListingImageSerializer(
            self.image,
            context={"request": request},
        )

        path_image = urlparse(serializer.data["image_url"]).path

        self.assertTrue(path_image.startswith("/media/"))
        self.assertTrue(default_storage.exists(self.image.image.name))

        if serializer.data["is_main"]:
            path_thumbnail = urlparse(serializer.data["thumbnail_url"]).path

            self.assertTrue(path_thumbnail.startswith("/media/"))
            self.assertTrue(default_storage.exists(self.image.thumbnail.name))


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class UpdatePropertyAPITests(BaseListingTestMixin, APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = create_test_user(
            username="update_user",
            email="update@test.com",
            password="secret123",
            is_host=True,
        )

        cls.other_user = create_test_user(
            username="other_update_user",
            email="other-update@test.com",
            password="secret123",
            is_host=True,
        )

        cls.municipality = cls.get_existing_municipality()

    def setUp(self):
        self.listing = self.create_listing(owner=self.user)
        self.url = reverse("update-property", kwargs={"pk": self.listing.pk})

    def get_update_payload(self):
        return {
            "municipality": self.municipality.pk,
            "title": "Apartamento actualizado",
            "description": "Descripción actualizada suficientemente larga.",
            "bedrooms": 2,
            "bathrooms": 2,
            "locationdesc": "Ubicación actualizada suficientemente larga.",
            "addresstext": "Calle actualizada #10-20",
            "propertytype": "apartment",
            "pricepernight": 200000,
            "maxguests": 4,
            "exactlocation": self.get_valid_location(),
        }

    def test_requires_authentication_to_update_property_information(self):
        response = self.client.put(
            self.url,
            self.get_update_payload(),
            format="json",
        )

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

        self.listing.refresh_from_db()
        self.assertEqual(self.listing.title, "Apartamento original")

    def test_updates_property_information_successfully(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.put(
            self.url,
            self.get_update_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["message"],
            "Property information updated successfully.",
        )

        self.listing.refresh_from_db()

        self.assertEqual(self.listing.title, "Apartamento actualizado")
        self.assertEqual(
            self.listing.description,
            "Descripción actualizada suficientemente larga.",
        )
        self.assertEqual(self.listing.bedrooms, 2)
        self.assertEqual(self.listing.bathrooms, 2)
        self.assertEqual(self.listing.pricepernight, 200000)
        self.assertEqual(self.listing.maxguests, 4)
        self.assertEqual(self.listing.owner, self.user)

    def test_cannot_update_property_information_from_another_user(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.put(
            self.url,
            self.get_update_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.listing.refresh_from_db()
        self.assertEqual(self.listing.title, "Apartamento original")

    def test_owner_in_payload_is_ignored_when_updating_information(self):
        self.client.force_authenticate(user=self.user)

        payload = self.get_update_payload()
        payload["owner"] = self.other_user.pk

        response = self.client.put(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.listing.refresh_from_db()
        self.assertEqual(self.listing.owner, self.user)
        self.assertNotEqual(self.listing.owner, self.other_user)

    def test_keeps_existing_images_when_updating_only_information(self):
        self.client.force_authenticate(user=self.user)

        existing_image = ListingImage.objects.create(
            listing=self.listing,
            image=make_uploaded_image("existing_image.jpg"),
            is_main=True,
        )

        response = self.client.put(
            self.url,
            self.get_update_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(ListingImage.objects.filter(pk=existing_image.pk).exists())
        self.assertEqual(self.listing.images.count(), 1)

    def test_information_endpoint_ignores_images_when_sent(self):
        self.client.force_authenticate(user=self.user)

        old_image = ListingImage.objects.create(
            listing=self.listing,
            image=make_uploaded_image("old_image.jpg"),
            is_main=True,
        )

        payload = self.get_update_payload()
        payload["exactlocation"] = json.dumps(payload["exactlocation"])
        payload["images"] = [make_uploaded_image("ignored_image.jpg")]

        response = self.client.put(self.url, payload, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(ListingImage.objects.filter(pk=old_image.pk).exists())
        self.assertEqual(self.listing.images.count(), 1)

    def test_rejects_update_when_data_duplicates_another_listing_of_same_user(self):
        duplicated_listing = self.create_listing(
            owner=self.user,
            title="Casa duplicada",
            description="Descripción suficientemente larga para duplicado.",
            bedrooms=2,
            bathrooms=1,
            locationdesc="Ubicación duplicada suficientemente larga.",
            addresstext="Calle duplicada #1-2",
            propertytype="house",
            pricepernight=150000,
            maxguests=3,
        )

        self.client.force_authenticate(user=self.user)

        payload = self.get_update_payload()
        payload["municipality"] = duplicated_listing.municipality.pk
        payload["title"] = duplicated_listing.title
        payload["addresstext"] = duplicated_listing.addresstext

        response = self.client.put(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.listing.refresh_from_db()
        self.assertEqual(self.listing.title, "Apartamento original")

    def test_rejects_when_maxguests_is_less_than_bedrooms(self):
        self.client.force_authenticate(user=self.user)

        payload = self.get_update_payload()
        payload["bedrooms"] = 4
        payload["maxguests"] = 2

        response = self.client.put(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("maxguests", response.data)

    def test_rejects_when_bathrooms_is_greater_than_maxguests(self):
        self.client.force_authenticate(user=self.user)

        payload = self.get_update_payload()
        payload["bathrooms"] = 5
        payload["maxguests"] = 4

        response = self.client.put(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("bathrooms", response.data)

    def test_rejects_negative_pricepernight(self):
        self.client.force_authenticate(user=self.user)

        payload = self.get_update_payload()
        payload["pricepernight"] = -1

        response = self.client.put(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("pricepernight", response.data)

    def test_denies_geolocation_change_when_listing_has_bookings(self):
        self.client.force_authenticate(user=self.user)

        payload = self.get_update_payload()
        payload["exactlocation"] = self.get_alternate_valid_location()

        related_manager_class = type(self.listing.bookings)

        with patch.object(related_manager_class, "exists", return_value=True):
            response = self.client.put(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("exactlocation", response.data)

        self.listing.refresh_from_db()
        self.assertAlmostEqual(self.listing.exactlocation.y, self.get_valid_location()["lat"])
        self.assertAlmostEqual(self.listing.exactlocation.x, self.get_valid_location()["lng"])


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class UpdatePropertyImagesAPITests(BaseListingTestMixin, APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = create_test_user(
            username="update_images_user",
            email="update-images@test.com",
            password="secret123",
            is_host=True,
        )

        cls.other_user = create_test_user(
            username="other_update_images_user",
            email="other-update-images@test.com",
            password="secret123",
            is_host=True,
        )

        cls.municipality = cls.get_existing_municipality()

    def setUp(self):
        self.listing = self.create_listing(owner=self.user)
        self.old_image = ListingImage.objects.create(
            listing=self.listing,
            image=make_uploaded_image("old_image.jpg"),
            is_main=True,
        )
        self.url = reverse("update-property-images", kwargs={"pk": self.listing.pk})

    def test_requires_authentication_to_update_property_images(self):
        response = self.client.put(
            self.url,
            {"images": [make_uploaded_image("new_image.jpg")]},
            format="multipart",
        )

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )
        self.assertTrue(ListingImage.objects.filter(pk=self.old_image.pk).exists())

    def test_cannot_update_property_images_from_another_user(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.put(
            self.url,
            {"images": [make_uploaded_image("new_image.jpg")]},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(ListingImage.objects.filter(pk=self.old_image.pk).exists())

    def test_replaces_images_successfully(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.put(
            self.url,
            {
                "images": [
                    make_uploaded_image("new_image_1.jpg"),
                    make_uploaded_image("new_image_2.jpg"),
                ]
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["message"],
            "Property images updated successfully.",
        )

        self.assertFalse(ListingImage.objects.filter(pk=self.old_image.pk).exists())

        images = self.listing.images.order_by("id")
        self.assertEqual(images.count(), 2)
        self.assertTrue(images[0].is_main)
        self.assertFalse(images[1].is_main)

    def test_rejects_empty_images_payload_and_keeps_existing_images(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.put(self.url, {}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("images", response.data)
        self.assertTrue(ListingImage.objects.filter(pk=self.old_image.pk).exists())
        self.assertEqual(self.listing.images.count(), 1)

    def test_rejects_non_image_file_and_keeps_existing_images(self):
        self.client.force_authenticate(user=self.user)

        malicious_file = SimpleUploadedFile(
            "malicious.jpg",
            b"this is not a real image",
            content_type="image/jpeg",
        )

        response = self.client.put(
            self.url,
            {"images": [malicious_file]},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("images", response.data)
        self.assertTrue(ListingImage.objects.filter(pk=self.old_image.pk).exists())
        self.assertEqual(self.listing.images.count(), 1)

    def test_rejects_unsupported_image_content_type_and_keeps_existing_images(self):
        self.client.force_authenticate(user=self.user)

        unsupported_file = SimpleUploadedFile(
            "unsupported.pdf",
            b"%PDF-1.4 fake pdf content",
            content_type="application/pdf",
        )

        response = self.client.put(
            self.url,
            {"images": [unsupported_file]},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("images", response.data)
        self.assertTrue(ListingImage.objects.filter(pk=self.old_image.pk).exists())
        self.assertEqual(self.listing.images.count(), 1)