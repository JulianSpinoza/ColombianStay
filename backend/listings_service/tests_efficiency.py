import io
import json
import shutil
import tempfile
import time

from PIL import Image

from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Polygon, MultiPolygon
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import connection
from django.test import TestCase, override_settings
from django.test.utils import CaptureQueriesContext
from django.urls import reverse

from rest_framework.test import APITestCase

from listings_service.models import (
    Listing,
    ListingImage,
    Region,
    Department,
    Municipality,
)
from listings_service.utils import random_point_in_multipolygon


User = get_user_model()


def generate_test_image_file(name="test.jpg"):
    """
    Genera una imagen JPEG temporal para pruebas multipart.
    """
    file = io.BytesIO()
    image = Image.new("RGB", (100, 100))
    image.save(file, "jpeg")
    file.seek(0)

    return SimpleUploadedFile(
        name=name,
        content=file.read(),
        content_type="image/jpeg",
    )


class BaseEfficiencyTestMixin:
    """
    Mixin base para reutilizar creación de usuario, municipio,
    publicaciones, imágenes y payloads.
    """

    @classmethod
    def get_existing_municipality(cls):
        municipality = Municipality.objects.order_by("pk").first()

        if municipality is None:
            raise AssertionError(
                "No existen municipios cargados en la base de pruebas. "
                "Verifica tus migraciones, fixtures o datos iniciales."
            )

        return municipality

    @classmethod
    def create_test_user(
        cls,
        username="efficiency_user",
        email="efficiency@test.com",
        is_host=False,
    ):
        return User.objects.create_user(
            username=username,
            email=email,
            password="secret123",
            is_host=is_host,
        )

    @classmethod
    def create_listings(cls, total=100):
        """
        Crea publicaciones de prueba usando bulk_create para no hacer lenta
        la preparación del test.
        """
        listings = []

        for i in range(total):
            point = random_point_in_multipolygon(cls.municipality.boundary)

            listings.append(
                Listing(
                    owner=cls.user,
                    municipality=cls.municipality,
                    exactlocation=point,
                    title=f"Apartamento cómodo {i}",
                    description=(
                        "Apartamento amplio, cómodo y muy bien ubicado "
                        "para pruebas de eficiencia."
                    ),
                    bedrooms=(i % 4) + 1,
                    bathrooms=(i % 3) + 1,
                    locationdesc="Zona central con transporte público cercano.",
                    addresstext=f"Calle {i} #10-20",
                    propertytype="apartment",
                    pricepernight=80000 + (i * 1000),
                    maxguests=((i % 4) + 1) + 1,
                )
            )

        Listing.objects.bulk_create(listings)

    @classmethod
    def create_location_catalog_data(cls, total=20):
        """
        Crea datos adicionales para medir endpoints de ubicación.
        """
        for i in range(total):
            region = Region.objects.create(
                name=f"Región eficiencia {i}"
            )

            department = Department.objects.create(
                region=region,
                name=f"Departamento eficiencia {i}",
            )

            min_x = -77.00 - (i * 0.10)
            min_y = 5.00 + (i * 0.10)
            max_x = min_x + 0.05
            max_y = min_y + 0.05

            polygon = Polygon((
                (min_x, min_y),
                (max_x, min_y),
                (max_x, max_y),
                (min_x, max_y),
                (min_x, min_y),
            ), srid=4326)

            Municipality.objects.create(
                department=department,
                name=f"Municipio eficiencia {i}",
                boundary=MultiPolygon(polygon, srid=4326),
            )

    def get_valid_publish_payload(self):
        """
        Payload válido para POST /publish-listing/.
        Como PublishProperty usa MultiPartParser/FormParser,
        exactlocation se envía como JSON string.
        """
        point = random_point_in_multipolygon(self.municipality.boundary)

        return {
            "municipality": self.municipality.pk,
            "title": "Apartamento eficiente",
            "description": "Apartamento amplio, cómodo y bien ubicado para pruebas.",
            "bedrooms": 2,
            "bathrooms": 1,
            "locationdesc": "Muy cerca al parque principal y transporte público.",
            "addresstext": "Calle 123 #45-67",
            "propertytype": "apartment",
            "pricepernight": 120000,
            "maxguests": 3,
            "exactlocation": json.dumps({
                "lat": point.y,
                "lng": point.x,
            }),
            "images": [
                generate_test_image_file("image1.jpg"),
                generate_test_image_file("image2.jpg"),
            ],
        }

    def get_valid_update_payload(self):
        """
        Payload válido para PUT /listings/<pk>/edit/.
        Este endpoint acepta JSON, por eso exactlocation se envía como dict.
        """
        point = random_point_in_multipolygon(self.municipality.boundary)

        return {
            "municipality": self.municipality.pk,
            "title": "Apartamento actualizado eficiencia",
            "description": "Descripción actualizada suficientemente larga para eficiencia.",
            "bedrooms": 2,
            "bathrooms": 2,
            "locationdesc": "Ubicación actualizada suficientemente larga.",
            "addresstext": "Calle actualizada #10-20",
            "propertytype": "apartment",
            "pricepernight": 180000,
            "maxguests": 4,
            "exactlocation": {
                "lat": point.y,
                "lng": point.x,
            },
        }

    def create_single_listing(self, owner=None, **overrides):
        point = random_point_in_multipolygon(self.municipality.boundary)

        data = {
            "owner": owner or self.user,
            "municipality": self.municipality,
            "exactlocation": point,
            "title": "Apartamento base eficiencia",
            "description": "Descripción base suficientemente larga para eficiencia.",
            "bedrooms": 2,
            "bathrooms": 1,
            "locationdesc": "Ubicación base suficientemente larga.",
            "addresstext": "Calle base #1-2",
            "propertytype": "apartment",
            "pricepernight": 100000,
            "maxguests": 3,
        }

        data.update(overrides)

        return Listing.objects.create(**data)


class ListingListEfficiencyTests(BaseEfficiencyTestMixin, TestCase):
    """
    Pruebas internas de eficiencia para GET /listings/.
    Evalúan cantidad de consultas y tiempo aproximado de respuesta.
    """

    @classmethod
    def setUpTestData(cls):
        cls.user = cls.create_test_user(
            username="list_efficiency_user",
            email="list-efficiency@test.com",
        )
        cls.municipality = cls.get_existing_municipality()
        cls.create_listings(total=100)

    def test_listing_list_query_count(self):
        url = reverse("listing-list")

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.get(url)

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /listings/")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 200)

        self.assertLessEqual(
            query_count,
            15,
            "El endpoint /listings/ está ejecutando demasiadas consultas SQL.",
        )

    def test_listing_list_response_time(self):
        url = reverse("listing-list")

        start = time.perf_counter()
        response = self.client.get(url)
        elapsed = time.perf_counter() - start

        print("\n[EFFICIENCY] /listings/")
        print(f"Tiempo de respuesta: {elapsed:.4f} segundos")

        self.assertEqual(response.status_code, 200)

        self.assertLess(
            elapsed,
            1.0,
            "El endpoint /listings/ tardó más de 1 segundo en responder.",
        )


class ListingSearchEfficiencyTests(BaseEfficiencyTestMixin, TestCase):
    """
    Pruebas internas de eficiencia para GET /listings/search/.
    Este endpoint aplica filtros dinámicos y además genera sugerencias.
    """

    @classmethod
    def setUpTestData(cls):
        cls.user = cls.create_test_user(
            username="search_efficiency_user",
            email="search-efficiency@test.com",
        )
        cls.municipality = cls.get_existing_municipality()
        cls.create_listings(total=300)

    def test_listing_search_query_count_with_keyword_and_filters(self):
        url = reverse("listing-search")

        params = {
            "keyword": "Apartamento",
            "min_price": 80000,
            "max_price": 300000,
            "bedrooms": 2,
            "bathrooms": 1,
            "maxguests": 2,
        }

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.get(url, params)

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /listings/search/")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 200)

        self.assertLessEqual(
            query_count,
            30,
            "El endpoint /listings/search/ está ejecutando demasiadas consultas SQL.",
        )

    def test_listing_search_response_time_with_keyword_and_filters(self):
        url = reverse("listing-search")

        params = {
            "keyword": "Apartamento",
            "min_price": 80000,
            "max_price": 300000,
            "bedrooms": 2,
            "bathrooms": 1,
            "maxguests": 2,
        }

        start = time.perf_counter()
        response = self.client.get(url, params)
        elapsed = time.perf_counter() - start

        print("\n[EFFICIENCY] /listings/search/")
        print(f"Tiempo de respuesta: {elapsed:.4f} segundos")

        self.assertEqual(response.status_code, 200)

        self.assertLess(
            elapsed,
            1.0,
            "El endpoint /listings/search/ tardó más de 1 segundo en responder.",
        )

    def test_listing_search_query_count_without_filters(self):
        url = reverse("listing-search")

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.get(url)

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /listings/search/ sin filtros")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 200)

        self.assertLessEqual(
            query_count,
            30,
            "La búsqueda sin filtros está ejecutando demasiadas consultas SQL.",
        )


class ListingDetailEfficiencyTests(BaseEfficiencyTestMixin, TestCase):
    """
    Pruebas internas de eficiencia para GET /listings/<id>/.
    """

    @classmethod
    def setUpTestData(cls):
        cls.user = cls.create_test_user(
            username="detail_efficiency_user",
            email="detail-efficiency@test.com",
        )
        cls.municipality = cls.get_existing_municipality()
        cls.create_listings(total=20)
        cls.listing = Listing.objects.order_by("pk").first()

    def test_listing_detail_query_count(self):
        url = reverse(
            "listing-detail",
            kwargs={"pk": self.listing.pk},
        )

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.get(url)

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /listings/<id>/")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 200)

        self.assertLessEqual(
            query_count,
            15,
            "El detalle de publicación está ejecutando demasiadas consultas SQL.",
        )

    def test_listing_detail_response_time(self):
        url = reverse(
            "listing-detail",
            kwargs={"pk": self.listing.pk},
        )

        start = time.perf_counter()
        response = self.client.get(url)
        elapsed = time.perf_counter() - start

        print("\n[EFFICIENCY] /listings/<id>/")
        print(f"Tiempo de respuesta: {elapsed:.4f} segundos")

        self.assertEqual(response.status_code, 200)

        self.assertLess(
            elapsed,
            1.0,
            "El detalle de publicación tardó más de 1 segundo en responder.",
        )


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class PublishListingEfficiencyTests(BaseEfficiencyTestMixin, APITestCase):
    """
    Pruebas internas de eficiencia para POST /publish-listing/.
    Incluye creación de publicación, imágenes y thumbnails.
    """

    @classmethod
    def setUpTestData(cls):
        cls.user = cls.create_test_user(
            username="publish_efficiency_user",
            email="publish-efficiency@test.com",
        )
        cls.municipality = cls.get_existing_municipality()

    @classmethod
    def tearDownClass(cls):
        """
        Limpia archivos temporales generados durante pruebas de imágenes.
        """
        media_root = getattr(cls, "_overridden_settings", {}).get("MEDIA_ROOT", None)

        try:
            if media_root:
                shutil.rmtree(media_root, ignore_errors=True)
        finally:
            super().tearDownClass()

    def setUp(self):
        self.client.force_authenticate(user=self.user)

    def test_publish_listing_query_count(self):
        url = reverse("publish-property")
        payload = self.get_valid_publish_payload()

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.post(
                url,
                payload,
                format="multipart",
            )

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /publish-listing/")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 201)

        self.assertLessEqual(
            query_count,
            30,
            "La publicación de una propiedad está ejecutando demasiadas consultas SQL.",
        )

    def test_publish_listing_response_time(self):
        url = reverse("publish-property")
        payload = self.get_valid_publish_payload()

        start = time.perf_counter()

        response = self.client.post(
            url,
            payload,
            format="multipart",
        )

        elapsed = time.perf_counter() - start

        print("\n[EFFICIENCY] /publish-listing/")
        print(f"Tiempo de respuesta: {elapsed:.4f} segundos")

        self.assertEqual(response.status_code, 201)

        self.assertLess(
            elapsed,
            2.0,
            "La publicación de una propiedad tardó más de 2 segundos.",
        )


class UpdatePropertyEfficiencyTests(BaseEfficiencyTestMixin, APITestCase):
    """
    Pruebas internas de eficiencia para PUT /listings/<id>/edit/.
    Evalúan la actualización de información de una publicación.
    """

    @classmethod
    def setUpTestData(cls):
        cls.user = cls.create_test_user(
            username="update_efficiency_user",
            email="update-efficiency@test.com",
            is_host=True,
        )
        cls.municipality = cls.get_existing_municipality()

    def setUp(self):
        self.client.force_authenticate(user=self.user)

        self.listing = self.create_single_listing(
            owner=self.user,
            title="Apartamento update eficiencia",
            addresstext="Calle update #1-2",
        )

        self.url = reverse(
            "update-property",
            kwargs={"pk": self.listing.pk},
        )

    def test_update_property_query_count(self):
        payload = self.get_valid_update_payload()

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.put(
                self.url,
                payload,
                format="json",
            )

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /listings/<id>/edit/")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 200)

        self.assertLessEqual(
            query_count,
            50,
            "La actualización de información de propiedad ejecuta demasiadas consultas SQL.",
        )

    def test_update_property_response_time(self):
        payload = self.get_valid_update_payload()

        start = time.perf_counter()

        response = self.client.put(
            self.url,
            payload,
            format="json",
        )

        elapsed = time.perf_counter() - start

        print("\n[EFFICIENCY] /listings/<id>/edit/")
        print(f"Tiempo de respuesta: {elapsed:.4f} segundos")

        self.assertEqual(response.status_code, 200)

        self.assertLess(
            elapsed,
            1.0,
            "La actualización de información de propiedad tardó más de 1 segundo.",
        )


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class UpdatePropertyImagesEfficiencyTests(BaseEfficiencyTestMixin, APITestCase):
    """
    Pruebas internas de eficiencia para PUT /listings/<id>/edit/images/.
    Evalúan reemplazo de imágenes, creación de thumbnails y respuesta.
    """

    @classmethod
    def setUpTestData(cls):
        cls.user = cls.create_test_user(
            username="update_images_efficiency_user",
            email="update-images-efficiency@test.com",
            is_host=True,
        )
        cls.municipality = cls.get_existing_municipality()

    @classmethod
    def tearDownClass(cls):
        media_root = getattr(cls, "_overridden_settings", {}).get("MEDIA_ROOT", None)

        try:
            if media_root:
                shutil.rmtree(media_root, ignore_errors=True)
        finally:
            super().tearDownClass()

    def setUp(self):
        self.client.force_authenticate(user=self.user)

        self.listing = self.create_single_listing(
            owner=self.user,
            title="Apartamento imágenes eficiencia",
            addresstext="Calle imágenes #1-2",
        )

        self.old_image = ListingImage.objects.create(
            listing=self.listing,
            image=generate_test_image_file("old_image.jpg"),
            is_main=True,
        )

        self.url = reverse(
            "update-property-images",
            kwargs={"pk": self.listing.pk},
        )

    def get_images_payload(self):
        return {
            "images": [
                generate_test_image_file("new_image_1.jpg"),
                generate_test_image_file("new_image_2.jpg"),
            ]
        }

    def test_update_property_images_query_count(self):
        with CaptureQueriesContext(connection) as ctx:
            response = self.client.put(
                self.url,
                self.get_images_payload(),
                format="multipart",
            )

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /listings/<id>/edit/images/")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 200)

        self.assertLessEqual(
            query_count,
            50,
            "La actualización de imágenes ejecuta demasiadas consultas SQL.",
        )

    def test_update_property_images_response_time(self):
        start = time.perf_counter()

        response = self.client.put(
            self.url,
            self.get_images_payload(),
            format="multipart",
        )

        elapsed = time.perf_counter() - start

        print("\n[EFFICIENCY] /listings/<id>/edit/images/")
        print(f"Tiempo de respuesta: {elapsed:.4f} segundos")

        self.assertEqual(response.status_code, 200)

        self.assertLess(
            elapsed,
            2.0,
            "La actualización de imágenes tardó más de 2 segundos.",
        )


class LocationCatalogEfficiencyTests(BaseEfficiencyTestMixin, TestCase):
    """
    Pruebas internas de eficiencia para endpoints de catálogos de ubicación:
    - GET /listings/region/
    - GET /listings/region/<region_id>/
    - GET /listings/department/<department_id>/
    - GET /location-terms/
    """

    @classmethod
    def setUpTestData(cls):
        cls.create_location_catalog_data(total=30)

        cls.region = Region.objects.create(
            name="Región eficiencia objetivo"
        )

        cls.department = Department.objects.create(
            region=cls.region,
            name="Departamento eficiencia objetivo",
        )

        polygon = Polygon((
            (-73.50, 4.80),
            (-73.40, 4.80),
            (-73.40, 4.90),
            (-73.50, 4.90),
            (-73.50, 4.80),
        ), srid=4326)

        cls.municipality = Municipality.objects.create(
            department=cls.department,
            name="Municipio eficiencia objetivo",
            boundary=MultiPolygon(polygon, srid=4326),
        )

    def test_region_list_query_count(self):
        url = reverse("region-list")

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.get(url)

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /listings/region/")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 200)

        self.assertLessEqual(
            query_count,
            5,
            "El listado de regiones ejecuta demasiadas consultas SQL.",
        )

    def test_region_list_response_time(self):
        url = reverse("region-list")

        start = time.perf_counter()
        response = self.client.get(url)
        elapsed = time.perf_counter() - start

        print("\n[EFFICIENCY] /listings/region/")
        print(f"Tiempo de respuesta: {elapsed:.4f} segundos")

        self.assertEqual(response.status_code, 200)

        self.assertLess(
            elapsed,
            1.0,
            "El listado de regiones tardó más de 1 segundo.",
        )

    def test_department_list_query_count(self):
        url = reverse(
            "department-list",
            kwargs={"region_id": self.region.pk},
        )

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.get(url)

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /listings/region/<region_id>/")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 200)

        self.assertLessEqual(
            query_count,
            5,
            "El listado de departamentos ejecuta demasiadas consultas SQL.",
        )

    def test_department_list_response_time(self):
        url = reverse(
            "department-list",
            kwargs={"region_id": self.region.pk},
        )

        start = time.perf_counter()
        response = self.client.get(url)
        elapsed = time.perf_counter() - start

        print("\n[EFFICIENCY] /listings/region/<region_id>/")
        print(f"Tiempo de respuesta: {elapsed:.4f} segundos")

        self.assertEqual(response.status_code, 200)

        self.assertLess(
            elapsed,
            1.0,
            "El listado de departamentos tardó más de 1 segundo.",
        )

    def test_municipality_list_query_count(self):
        url = reverse(
            "municipality-list",
            kwargs={"department_id": self.department.pk},
        )

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.get(url)

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /listings/department/<department_id>/")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 200)

        self.assertLessEqual(
            query_count,
            5,
            "El listado de municipios ejecuta demasiadas consultas SQL.",
        )

    def test_municipality_list_response_time(self):
        url = reverse(
            "municipality-list",
            kwargs={"department_id": self.department.pk},
        )

        start = time.perf_counter()
        response = self.client.get(url)
        elapsed = time.perf_counter() - start

        print("\n[EFFICIENCY] /listings/department/<department_id>/")
        print(f"Tiempo de respuesta: {elapsed:.4f} segundos")

        self.assertEqual(response.status_code, 200)

        self.assertLess(
            elapsed,
            1.0,
            "El listado de municipios tardó más de 1 segundo.",
        )

    def test_location_terms_query_count(self):
        url = reverse("all_locations_list")

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.get(url)

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /location-terms/")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 200)

        self.assertLessEqual(
            query_count,
            5,
            "El endpoint unificado de ubicaciones ejecuta demasiadas consultas SQL.",
        )

    def test_location_terms_response_time(self):
        url = reverse("all_locations_list")

        start = time.perf_counter()
        response = self.client.get(url)
        elapsed = time.perf_counter() - start

        print("\n[EFFICIENCY] /location-terms/")
        print(f"Tiempo de respuesta: {elapsed:.4f} segundos")

        self.assertEqual(response.status_code, 200)

        self.assertLess(
            elapsed,
            1.0,
            "El endpoint unificado de ubicaciones tardó más de 1 segundo.",
        )