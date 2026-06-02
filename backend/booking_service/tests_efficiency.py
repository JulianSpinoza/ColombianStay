from datetime import timedelta
from decimal import Decimal
import time

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib.gis.geos import GEOSGeometry, Point
from django.db import connection
from django.test.utils import CaptureQueriesContext
from django.urls import reverse
from django.utils import timezone

from rest_framework.test import APITestCase

from listings_service.models import Listing, Region, Department, Municipality
from booking_service.models import Booking, BookingStatus


User = get_user_model()


class BaseBookingEfficiencyTestMixin:
    """
    Mixin base para crear usuarios, ubicaciones, propiedades y reservas
    reutilizables en las pruebas de eficiencia del servicio booking_service.
    """

    @classmethod
    def mark_as_host(cls, user):
        """
        Marca un usuario como host usando las estrategias compatibles
        con el proyecto.
        """
        if hasattr(user, "is_host"):
            user.is_host = True

        for field_name in ["role", "user_type", "type"]:
            if hasattr(user, field_name):
                setattr(user, field_name, "HOST")

        user.save()

        host_group, _ = Group.objects.get_or_create(name="host")
        user.groups.add(host_group)

    @classmethod
    def create_base_data(cls):
        cls.guest = User.objects.create_user(
            username="eff_guest",
            email="eff-guest@test.com",
            password="testpass123",
        )

        cls.other_guest = User.objects.create_user(
            username="eff_other_guest",
            email="eff-other-guest@test.com",
            password="testpass123",
        )

        cls.host = User.objects.create_user(
            username="eff_host",
            email="eff-host@test.com",
            password="testpass123",
        )

        cls.other_host = User.objects.create_user(
            username="eff_other_host",
            email="eff-other-host@test.com",
            password="testpass123",
        )

        cls.mark_as_host(cls.host)
        cls.mark_as_host(cls.other_host)

        cls.region = Region.objects.create(
            name="Región eficiencia",
        )

        cls.department = Department.objects.create(
            region=cls.region,
            name="Departamento eficiencia",
        )

        cls.municipality = Municipality.objects.create(
            department=cls.department,
            name="Municipio eficiencia",
            boundary=GEOSGeometry(
                "SRID=4326;MULTIPOLYGON((("
                "-74.10 4.60, "
                "-74.09 4.60, "
                "-74.09 4.61, "
                "-74.10 4.61, "
                "-74.10 4.60"
                ")))"
            ),
        )

        cls.listing = Listing.objects.create(
            owner=cls.host,
            municipality=cls.municipality,
            title="Casa eficiencia",
            description="Descripción suficientemente larga para eficiencia.",
            bedrooms=2,
            bathrooms=1,
            locationdesc="Ubicación de prueba para eficiencia.",
            addresstext="Dirección eficiencia 1",
            propertytype="cabin",
            pricepernight=Decimal("100.00"),
            maxguests=4,
            exactlocation=Point(-74.095, 4.605, srid=4326),
        )

        cls.other_listing = Listing.objects.create(
            owner=cls.other_host,
            municipality=cls.municipality,
            title="Otra casa eficiencia",
            description="Otra descripción suficientemente larga.",
            bedrooms=3,
            bathrooms=2,
            locationdesc="Otra ubicación de prueba.",
            addresstext="Dirección eficiencia 2",
            propertytype="house",
            pricepernight=Decimal("150.00"),
            maxguests=5,
            exactlocation=Point(-74.096, 4.606, srid=4326),
        )

    @classmethod
    def create_bookings_for_guest(cls, total=50):
        """
        Crea varias reservas del guest principal.
        Se alternan estados para simular datos más cercanos a producción.
        """
        statuses = [
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.ACTIVE,
            BookingStatus.COMPLETED,
        ]

        for i in range(total):
            check_in = timezone.localdate() + timedelta(days=10 + (i * 3))
            check_out = check_in + timedelta(days=2)

            Booking.objects.create(
                listing=cls.listing,
                guest=cls.guest,
                check_in_date=check_in,
                check_out_date=check_out,
                number_of_guests=2,
                actual_status=statuses[i % len(statuses)],
            )

    @classmethod
    def create_bookings_for_host(cls, total=50):
        """
        Crea reservas sobre propiedades del host principal.
        """
        statuses = [
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.ACTIVE,
            BookingStatus.COMPLETED,
        ]

        for i in range(total):
            check_in = timezone.localdate() + timedelta(days=200 + (i * 3))
            check_out = check_in + timedelta(days=2)

            Booking.objects.create(
                listing=cls.listing,
                guest=cls.other_guest,
                check_in_date=check_in,
                check_out_date=check_out,
                number_of_guests=2,
                actual_status=statuses[i % len(statuses)],
            )

    @classmethod
    def create_confirmed_booking(cls, check_in_days=30):
        """
        Crea una reserva confirmada, útil para pruebas de cancelación.
        """
        return Booking.objects.create(
            listing=cls.listing,
            guest=cls.guest,
            check_in_date=timezone.localdate() + timedelta(days=check_in_days),
            check_out_date=timezone.localdate() + timedelta(days=check_in_days + 2),
            number_of_guests=2,
            actual_status=BookingStatus.CONFIRMED,
        )


class UserReservationsEfficiencyTests(
    BaseBookingEfficiencyTestMixin,
    APITestCase,
):
    """
    Pruebas de eficiencia para GET /user-reservations/.
    """

    @classmethod
    def setUpTestData(cls):
        cls.create_base_data()
        cls.create_bookings_for_guest(total=60)

    def setUp(self):
        self.client.force_authenticate(user=self.guest)

    def test_user_reservations_query_count(self):
        url = reverse("user-reservations")

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.get(url, format="json")

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /user-reservations/")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 200)

        self.assertLessEqual(
            query_count,
            80,
            "El listado de reservas del usuario ejecuta demasiadas consultas SQL.",
        )

    def test_user_reservations_response_time(self):
        url = reverse("user-reservations")

        start = time.perf_counter()
        response = self.client.get(url, format="json")
        elapsed = time.perf_counter() - start

        print("\n[EFFICIENCY] /user-reservations/")
        print(f"Tiempo de respuesta: {elapsed:.4f} segundos")

        self.assertEqual(response.status_code, 200)

        self.assertLess(
            elapsed,
            1.0,
            "El listado de reservas del usuario tardó más de 1 segundo.",
        )


class HostReservationsEfficiencyTests(
    BaseBookingEfficiencyTestMixin,
    APITestCase,
):
    """
    Pruebas de eficiencia para GET /host-reservations/.
    """

    @classmethod
    def setUpTestData(cls):
        cls.create_base_data()
        cls.create_bookings_for_host(total=60)

    def setUp(self):
        self.client.force_authenticate(user=self.host)

    def test_host_reservations_query_count(self):
        url = reverse("host-reservations")

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.get(url, format="json")

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /host-reservations/")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 200)

        self.assertLessEqual(
            query_count,
            80,
            "El listado de reservas del host ejecuta demasiadas consultas SQL.",
        )

    def test_host_reservations_response_time(self):
        url = reverse("host-reservations")

        start = time.perf_counter()
        response = self.client.get(url, format="json")
        elapsed = time.perf_counter() - start

        print("\n[EFFICIENCY] /host-reservations/")
        print(f"Tiempo de respuesta: {elapsed:.4f} segundos")

        self.assertEqual(response.status_code, 200)

        self.assertLess(
            elapsed,
            1.0,
            "El listado de reservas del host tardó más de 1 segundo.",
        )


class BookingPreInformationEfficiencyTests(
    BaseBookingEfficiencyTestMixin,
    APITestCase,
):
    """
    Pruebas de eficiencia para POST /bookings/preinformation/.
    """

    @classmethod
    def setUpTestData(cls):
        cls.create_base_data()

        for i in range(20):
            check_in = timezone.localdate() + timedelta(days=10 + (i * 5))
            check_out = check_in + timedelta(days=2)

            Booking.objects.create(
                listing=cls.other_listing,
                guest=cls.other_guest,
                check_in_date=check_in,
                check_out_date=check_out,
                number_of_guests=2,
                actual_status=BookingStatus.CONFIRMED,
            )

    def get_payload(self):
        return {
            "property_id": self.other_listing.pk,
            "check_in": str(timezone.localdate() + timedelta(days=150)),
            "check_out": str(timezone.localdate() + timedelta(days=153)),
            "guests": 2,
        }

    def test_preinformation_query_count(self):
        url = reverse("obtain-total-price")

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.post(
                url,
                self.get_payload(),
                format="json",
            )

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /bookings/preinformation/")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 200)

        self.assertLessEqual(
            query_count,
            20,
            "La preinformación de reserva ejecuta demasiadas consultas SQL.",
        )

    def test_preinformation_response_time(self):
        url = reverse("obtain-total-price")

        start = time.perf_counter()
        response = self.client.post(
            url,
            self.get_payload(),
            format="json",
        )
        elapsed = time.perf_counter() - start

        print("\n[EFFICIENCY] /bookings/preinformation/")
        print(f"Tiempo de respuesta: {elapsed:.4f} segundos")

        self.assertEqual(response.status_code, 200)

        self.assertLess(
            elapsed,
            1.0,
            "La preinformación de reserva tardó más de 1 segundo.",
        )


class CreateBookingEfficiencyTests(
    BaseBookingEfficiencyTestMixin,
    APITestCase,
):
    """
    Pruebas de eficiencia para POST /bookings/.
    """

    @classmethod
    def setUpTestData(cls):
        cls.create_base_data()

    def setUp(self):
        self.client.force_authenticate(user=self.guest)

    def get_payload(self):
        return {
            "property_id": self.other_listing.pk,
            "check_in_date": str(timezone.localdate() + timedelta(days=60)),
            "check_out_date": str(timezone.localdate() + timedelta(days=63)),
            "number_of_guests": 2,
        }

    def test_create_booking_query_count(self):
        url = reverse("create-booking")

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.post(
                url,
                self.get_payload(),
                format="json",
            )

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /bookings/")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 201)

        self.assertLessEqual(
            query_count,
            25,
            "La creación de reserva ejecuta demasiadas consultas SQL.",
        )

    def test_create_booking_response_time(self):
        url = reverse("create-booking")

        start = time.perf_counter()
        response = self.client.post(
            url,
            self.get_payload(),
            format="json",
        )
        elapsed = time.perf_counter() - start

        print("\n[EFFICIENCY] /bookings/")
        print(f"Tiempo de respuesta: {elapsed:.4f} segundos")

        self.assertEqual(response.status_code, 201)

        self.assertLess(
            elapsed,
            1.0,
            "La creación de reserva tardó más de 1 segundo.",
        )


class GuestCancelReservationEfficiencyTests(
    BaseBookingEfficiencyTestMixin,
    APITestCase,
):
    """
    Pruebas de eficiencia para PATCH /reservations/<id>/cancel/guest/.
    """

    @classmethod
    def setUpTestData(cls):
        cls.create_base_data()

    def setUp(self):
        self.booking = self.create_confirmed_booking(check_in_days=30)
        self.client.force_authenticate(user=self.guest)

    def test_guest_cancel_query_count(self):
        url = reverse(
            "guest-cancel-reservation",
            args=[self.booking.pk],
        )

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.patch(
                url,
                {"reason": "Cambio de planes"},
                format="json",
            )

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /reservations/<id>/cancel/guest/")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 200)

        self.assertLessEqual(
            query_count,
            25,
            "La cancelación por huésped ejecuta demasiadas consultas SQL.",
        )

    def test_guest_cancel_response_time(self):
        url = reverse(
            "guest-cancel-reservation",
            args=[self.booking.pk],
        )

        start = time.perf_counter()
        response = self.client.patch(
            url,
            {"reason": "Cambio de planes"},
            format="json",
        )
        elapsed = time.perf_counter() - start

        print("\n[EFFICIENCY] /reservations/<id>/cancel/guest/")
        print(f"Tiempo de respuesta: {elapsed:.4f} segundos")

        self.assertEqual(response.status_code, 200)

        self.assertLess(
            elapsed,
            1.0,
            "La cancelación por huésped tardó más de 1 segundo.",
        )


class HostCancelReservationEfficiencyTests(
    BaseBookingEfficiencyTestMixin,
    APITestCase,
):
    """
    Pruebas de eficiencia para PATCH /reservations/<id>/cancel/host/.
    """

    @classmethod
    def setUpTestData(cls):
        cls.create_base_data()

    def setUp(self):
        self.booking = self.create_confirmed_booking(check_in_days=30)
        self.client.force_authenticate(user=self.host)

    def test_host_cancel_query_count(self):
        url = reverse(
            "host-cancel-reservation",
            args=[self.booking.pk],
        )

        with CaptureQueriesContext(connection) as ctx:
            response = self.client.patch(
                url,
                {"reason": "Mantenimiento urgente"},
                format="json",
            )

        query_count = len(ctx.captured_queries)

        print("\n[EFFICIENCY] /reservations/<id>/cancel/host/")
        print("Consultas ejecutadas:", query_count)

        self.assertEqual(response.status_code, 200)

        self.assertLessEqual(
            query_count,
            30,
            "La cancelación por anfitrión ejecuta demasiadas consultas SQL.",
        )

    def test_host_cancel_response_time(self):
        url = reverse(
            "host-cancel-reservation",
            args=[self.booking.pk],
        )

        start = time.perf_counter()
        response = self.client.patch(
            url,
            {"reason": "Mantenimiento urgente"},
            format="json",
        )
        elapsed = time.perf_counter() - start

        print("\n[EFFICIENCY] /reservations/<id>/cancel/host/")
        print(f"Tiempo de respuesta: {elapsed:.4f} segundos")

        self.assertEqual(response.status_code, 200)

        self.assertLess(
            elapsed,
            1.0,
            "La cancelación por anfitrión tardó más de 1 segundo.",
        )