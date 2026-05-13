from typing import Self
from unittest.mock import patch
from urllib.parse import urlparse

from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.test import TestCase, override_settings
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files.storage import default_storage
from rest_framework import status
from rest_framework.test import APITestCase, APITransactionTestCase, APIRequestFactory

from PIL import Image

from listings_service.models import Listing, ListingImage, Municipality
from listings_service.serializers import PublishListingSerializer, ListingImageSerializer

import tempfile
import shutil
import io

User = get_user_model()

def generate_test_image():
    file = io.BytesIO()
    image = Image.new('RGB', (100, 100))
    image.save(file, 'jpeg')
    file.seek(0)
    return file

class DummySignedRequest():
    def __init__(self, user):
        self.user = user


class BaseListingTestMixin:
    @classmethod
    def get_existing_municipality(cls):
        municipality = Municipality.objects.order_by("pk").first()
        if municipality is None:
            raise AssertionError(
                "No existen municipios cargados en la base de pruebas. "
                "Verifica tus migraciones/mock data o crea fixtures."
            )
        return municipality

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
        }


class PublishListingSerializerTests(BaseListingTestMixin, TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            username="serializer_user",
            email="serializer@test.com",
            password="secret123",
            is_host=False,
        )
        cls.municipality = cls.get_existing_municipality()

    def test_serializer_accepts_valid_payload(self):
        serializer = PublishListingSerializer(
            data=self.get_valid_payload(),
            context={"request": DummySignedRequest(self.user)},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_rejects_when_maxguests_is_less_than_bedrooms(self):
        data = self.get_valid_payload()
        data["bedrooms"] = 4
        data["maxguests"] = 2

        serializer = PublishListingSerializer(
            data=data,
            context={"request": DummySignedRequest(self.user)},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("maxguests", serializer.errors)

    def test_rejects_when_title_equals_description(self):
        data = self.get_valid_payload()
        data["title"] = "Mismo texto"
        data["description"] = "Mismo texto"

        serializer = PublishListingSerializer(
            data=data,
            context={"request": DummySignedRequest(self.user)},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("description", serializer.errors)

    def test_rejects_duplicate_listing_for_same_user(self):
        Listing.objects.create(
            owner=self.user,
            municipality=self.municipality,
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
            data=self.get_valid_payload(),
            context={"request": DummySignedRequest(self.user)},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)

    def test_allows_same_title_and_address_for_different_user(self):
        other_user = User.objects.create_user(
            username="other_user",
            email="other@test.com",
            password="secret123",
            is_host=False,
        )

        Listing.objects.create(
            owner=other_user,
            municipality=self.municipality,
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
            data=self.get_valid_payload(),
            context={"request": DummySignedRequest(self.user)},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)


class PublishPropertyAPITests(BaseListingTestMixin, APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            username="api_user",
            email="api@test.com",
            password="secret123",
            is_host=False,
        )
        cls.municipality = cls.get_existing_municipality()
        cls.url = reverse("publish-property")

    def test_requires_authentication(self):
        response = self.client.post(self.url, self.get_valid_payload(), format="json")

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

    def test_create_property_successfully(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(self.url, self.get_valid_payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Listing.objects.count(), 1)

        listing = Listing.objects.get()
        self.assertEqual(listing.owner, self.user)
        self.assertEqual(listing.municipality, self.municipality)
        self.assertEqual(listing.title, "Apartamento amplio")

    def test_sets_user_as_host_when_property_is_created(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(self.url, self.get_valid_payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.user.refresh_from_db()
        self.assertTrue(self.user.is_host)

    def test_rejects_invalid_municipality(self):
        self.client.force_authenticate(user=self.user)
        payload = self.get_valid_payload()
        payload["municipality"] = 99999999

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("municipality", response.data)

    def test_rejects_duplicate_listing_for_same_user(self):
        self.client.force_authenticate(user=self.user)

        first_response = self.client.post(self.url, self.get_valid_payload(), format="json")
        second_response = self.client.post(self.url, self.get_valid_payload(), format="json")

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Listing.objects.count(), 1)
        self.assertEqual(
            second_response.data["message"],
            "Ya existe una publicación duplicada para este usuario."
        )

    def test_owner_in_payload_is_ignored(self):
        self.client.force_authenticate(user=self.user)
        payload = self.get_valid_payload()
        payload["owner"] = 999999

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        listing = Listing.objects.get()
        self.assertEqual(listing.owner, self.user)

    def test_allows_same_title_and_address_for_different_user(self):
        self.client.force_authenticate(user=self.user)
        first_response = self.client.post(self.url, self.get_valid_payload(), format="json")
        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)

        other_user = User.objects.create_user(
            username="second_api_user",
            email="second-api@test.com",
            password="secret123",
            is_host=False,
        )

        self.client.force_authenticate(user=other_user)
        second_response = self.client.post(self.url, self.get_valid_payload(), format="json")

        self.assertEqual(second_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Listing.objects.count(), 2)


class PublishPropertyTransactionTests(BaseListingTestMixin, APITransactionTestCase):
    reset_sequences = True

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("publish-property")

    def setUp(self):
        self.user = User.objects.create_user(
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
                self.client.post(self.url, self.get_valid_payload(), format="json")

        self.assertEqual(Listing.objects.count(), 0)

        self.user.refresh_from_db()
        self.assertFalse(self.user.is_host)

    def test_database_unique_constraint_prevents_duplicates(self):
        Listing.objects.create(
            owner=self.user,
            municipality=self.municipality,
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

        with self.assertRaises(IntegrityError):
            Listing.objects.create(
                owner=self.user,
                municipality=self.municipality,
                title="Apartamento amplio",
                description="Otra descripción suficientemente larga.",
                bedrooms=2,
                bathrooms=1,
                locationdesc="Otra ubicación válida con longitud suficiente.",
                addresstext="Calle 123 #45-67",
                propertytype="apartment",
                pricepernight=130000,
                maxguests=3,
            )

@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ListingImageModelTest(BaseListingTestMixin,TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.municipality = cls.get_existing_municipality()
        
        cls.user = User.objects.create_user(
            username="serializer_user",
            email="serializer@test.com",
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
        )

    def test_create_listing_image_and_thumbnail(self):

        image = SimpleUploadedFile(
            name='test_image.jpg',
            content=generate_test_image().read(),
            content_type='image/jpeg'
        )

        listing_image = ListingImage.objects.create(
            listing=self.listing,
            image=image,
            is_main=True
        )

        self.assertIsNotNone(listing_image.id)
        self.assertTrue(listing_image.image)
        self.assertTrue(listing_image.thumbnail)
    
    def test_unique_main_image(self):
        image1 = SimpleUploadedFile("img1.jpg", generate_test_image().read(), content_type="image/jpeg")
        image2 = SimpleUploadedFile("img2.jpg", generate_test_image().read(), content_type="image/jpeg")

        ListingImage.objects.create(
            listing=self.listing,
            image=image1,
            is_main=True
        )

        with self.assertRaises(IntegrityError):
            ListingImage.objects.create(
                listing=self.listing,
                image=image2,
                is_main=True
            )

    def test_image_url_returns_file(self):

        image = SimpleUploadedFile(
            name='test_image.jpg',
            content=generate_test_image().read(),
            content_type='image/jpeg'
        )

        listing_image = ListingImage.objects.create(
            listing=self.listing,
            image=image
        )

        self.assertTrue(default_storage.exists(listing_image.image.name))

        listing_image_is_main = ListingImage.objects.create(
            listing=self.listing,
            image=image,
            is_main=True
        )
        
        self.assertTrue(default_storage.exists(listing_image_is_main.image.name))
        self.assertTrue(default_storage.exists(listing_image_is_main.thumbnail.name))

@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ListingImageSerializerTest(BaseListingTestMixin,APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.municipality = cls.get_existing_municipality()
        cls.imageInstance = SimpleUploadedFile("test.jpg", generate_test_image().read(), content_type="image/jpeg")

        cls.user = User.objects.create_user(
            username="serializer_user",
            email="serializer@test.com",
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
        )

        cls.image = ListingImage.objects.create(
            listing=cls.listing,
            image=cls.imageInstance
        )

        cls.image.save()
    
    def test_serializer_fields(self):

        factory = APIRequestFactory()
        request = factory.get('/')
        
        serializer = ListingImageSerializer(
            self.image,
            context={'request': request}
        )

        data = serializer.data

        self.assertIn('image_url', data)
        self.assertIn('thumbnail_url', data)
        self.assertEqual(data['is_main'], False)
        self.assertNotIn('accomodationid', data)

    def test_serializer_url_is_accessible(self):

        factory = APIRequestFactory()
        request = factory.get('/')

        serializer = ListingImageSerializer(
            self.image,
            context={'request': request}
        )

        path_image = urlparse(serializer.data['image_url']).path

        self.assertTrue(path_image.startswith('/media/'))
        self.assertTrue(default_storage.exists(self.image.image.name))

        if(serializer.data['is_main']):
            path_thumbnail = urlparse(serializer.data['thumbnail_url']).path
            
            self.assertTrue(path_thumbnail.startswith('/media/'))
            self.assertTrue(default_storage.exists(self.image.thumbnail.name))