from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib.gis.geos import GEOSGeometry, Point
from django.urls import reverse
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APITestCase

from listings_service.models import Listing, Region, Department, Municipality
from .models import Booking, BookingStatus, BookingStatusHistory, Actuator


class BookingServiceAPITestCase(APITestCase):
    def setUp(self):
        User = get_user_model()

        self.guest = User.objects.create_user(
            username='guest',
            email='guest@test.com',
            password='testpass123'
        )

        self.other_guest = User.objects.create_user(
            username='otherguest',
            email='otherguest@test.com',
            password='testpass123'
        )

        self.host = User.objects.create_user(
            username='host',
            email='host@test.com',
            password='testpass123'
        )

        self.other_host = User.objects.create_user(
            username='otherhost',
            email='otherhost@test.com',
            password='testpass123'
        )

        self.mark_as_host(self.host)
        self.mark_as_host(self.other_host)

        self.region = Region.objects.create(
            name='Región test'
        )

        self.department = Department.objects.create(
            region=self.region,
            name='Departamento test'
        )

        self.municipality = Municipality.objects.create(
            department=self.department,
            name='Municipio test',
            boundary=GEOSGeometry(
                'SRID=4326;MULTIPOLYGON((('
                '-74.10 4.60, '
                '-74.09 4.60, '
                '-74.09 4.61, '
                '-74.10 4.61, '
                '-74.10 4.60'
                ')))'
            )
        )

        self.listing = Listing.objects.create(
            owner=self.host,
            municipality=self.municipality,
            title='Casa test',
            description='Descripción test',
            bedrooms=2,
            bathrooms=1,
            locationdesc='Ubicación test',
            addresstext='Dirección test',
            propertytype='Cabin',
            pricepernight=Decimal('100.00'),
            maxguests=4,
            exactlocation=Point(-74.10, 4.60, srid=4326),
        )

        self.other_listing = Listing.objects.create(
            owner=self.other_host,
            municipality=self.municipality,
            title='Otra casa test',
            description='Otra descripción test',
            bedrooms=2,
            bathrooms=1,
            locationdesc='Otra ubicación test',
            addresstext='Otra dirección test',
            propertytype='Cabin',
            pricepernight=Decimal('150.00'),
            maxguests=3,
            exactlocation=Point(-74.09, 4.61, srid=4326),
        )

        self.booking = Booking.objects.create(
            listing=self.listing,
            guest=self.guest,
            check_in_date=timezone.localdate() + timedelta(days=5),
            check_out_date=timezone.localdate() + timedelta(days=7),
            number_of_guests=2,
            actual_status=BookingStatus.CONFIRMED,
        )

    def mark_as_host(self, user):
        """
        Compatible con varias formas comunes de manejar roles.
        Ajusta esto si tu CustomUser tiene una estructura específica.
        """

        if hasattr(user, 'is_host'):
            user.is_host = True

        for field_name in ['role', 'user_type', 'type']:
            if hasattr(user, field_name):
                setattr(user, field_name, 'HOST')

        user.save()

        host_group, _ = Group.objects.get_or_create(name='host')
        user.groups.add(host_group)

    def create_booking(
        self,
        listing=None,
        guest=None,
        check_in_days=10,
        check_out_days=12,
        status_value=BookingStatus.CONFIRMED,
        guests=2,
    ):
        initial_status = (
            BookingStatus.CONFIRMED
            if status_value == BookingStatus.CANCELLED
            else status_value
        )

        booking = Booking.objects.create(
            listing=listing or self.listing,
            guest=guest or self.guest,
            check_in_date=timezone.localdate() + timedelta(days=check_in_days),
            check_out_date=timezone.localdate() + timedelta(days=check_out_days),
            number_of_guests=guests,
            actual_status=initial_status,
        )

        if status_value == BookingStatus.CANCELLED:
            booking.update_status(
                new_status=BookingStatus.CANCELLED,
                principal_actuator=Actuator.HOST,
                desc_of_transaction='Reserva cancelada para prueba.',
            )

        return booking


class CancelReservationAPITests(BookingServiceAPITestCase):
    def test_guest_can_cancel_own_reservation_with_reason_minimum_3_days_before(self):
        self.client.force_authenticate(user=self.guest)

        response = self.client.patch(
            reverse('guest-cancel-reservation', args=[self.booking.pk]),
            {'reason': 'Cambio de planes'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.booking.refresh_from_db()
        self.assertEqual(self.booking.actual_status, BookingStatus.CANCELLED)

        history = BookingStatusHistory.objects.get(
            booking=self.booking,
            status=BookingStatus.CANCELLED
        )

        self.assertEqual(history.principal_actuator, Actuator.GUEST)
        self.assertIn('Cambio de planes', history.desc_of_transaction)
        self.assertIn('huésped', history.desc_of_transaction.lower())

    def test_guest_cannot_cancel_without_reason(self):
        self.client.force_authenticate(user=self.guest)

        response = self.client.patch(
            reverse('guest-cancel-reservation', args=[self.booking.pk]),
            {'reason': ''},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.booking.refresh_from_db()
        self.assertEqual(self.booking.actual_status, BookingStatus.CONFIRMED)

    def test_guest_cannot_cancel_another_guest_reservation(self):
        self.client.force_authenticate(user=self.other_guest)

        response = self.client.patch(
            reverse('guest-cancel-reservation', args=[self.booking.pk]),
            {'reason': 'Intento cancelar reserva ajena'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_guest_cannot_cancel_less_than_3_days_before_check_in(self):
        self.booking.check_in_date = timezone.localdate() + timedelta(days=2)
        self.booking.check_out_date = timezone.localdate() + timedelta(days=4)
        self.booking.save()

        self.client.force_authenticate(user=self.guest)

        response = self.client.patch(
            reverse('guest-cancel-reservation', args=[self.booking.pk]),
            {'reason': 'Cancelación tarde'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.booking.refresh_from_db()
        self.assertEqual(self.booking.actual_status, BookingStatus.CONFIRMED)

    def test_guest_can_cancel_exactly_3_days_before_check_in(self):
        self.booking.check_in_date = timezone.localdate() + timedelta(days=3)
        self.booking.check_out_date = timezone.localdate() + timedelta(days=5)
        self.booking.save()

        self.client.force_authenticate(user=self.guest)

        response = self.client.patch(
            reverse('guest-cancel-reservation', args=[self.booking.pk]),
            {'reason': 'Cancelación permitida'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_host_can_cancel_reservation_of_own_property_with_reason(self):
        self.client.force_authenticate(user=self.host)

        response = self.client.patch(
            reverse('host-cancel-reservation', args=[self.booking.pk]),
            {'reason': 'Mantenimiento urgente de la propiedad'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.booking.refresh_from_db()
        self.assertEqual(self.booking.actual_status, BookingStatus.CANCELLED)

        history = BookingStatusHistory.objects.get(
            booking=self.booking,
            status=BookingStatus.CANCELLED
        )

        self.assertEqual(history.principal_actuator, Actuator.HOST)
        self.assertIn('Mantenimiento urgente de la propiedad', history.desc_of_transaction)
        self.assertIn('anfitrión', history.desc_of_transaction.lower())

    def test_host_cannot_cancel_without_reason(self):
        self.client.force_authenticate(user=self.host)

        response = self.client.patch(
            reverse('host-cancel-reservation', args=[self.booking.pk]),
            {},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.booking.refresh_from_db()
        self.assertEqual(self.booking.actual_status, BookingStatus.CONFIRMED)

    def test_non_host_user_cannot_use_host_cancel_endpoint(self):
        self.client.force_authenticate(user=self.guest)

        response = self.client.patch(
            reverse('host-cancel-reservation', args=[self.booking.pk]),
            {'reason': 'No soy host'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_host_cannot_cancel_reservation_from_another_host_property(self):
        self.client.force_authenticate(user=self.other_host)

        response = self.client.patch(
            reverse('host-cancel-reservation', args=[self.booking.pk]),
            {'reason': 'No es mi propiedad'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class CreateBookingAPITests(BookingServiceAPITestCase):
    def test_authenticated_user_can_create_booking(self):
        self.client.force_authenticate(user=self.guest)

        response = self.client.post(
            reverse('create-booking'),
            {
                'property_id': self.other_listing.pk,
                'check_in_date': str(timezone.localdate() + timedelta(days=20)),
                'check_out_date': str(timezone.localdate() + timedelta(days=23)),
                'number_of_guests': 2,
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        booking = Booking.objects.get(
            listing=self.other_listing,
            guest=self.guest,
            check_in_date=timezone.localdate() + timedelta(days=20),
            check_out_date=timezone.localdate() + timedelta(days=23),
        )

        self.assertEqual(booking.actual_status, BookingStatus.PENDING)
        self.assertEqual(booking.total_price, Decimal('450.00'))

        self.assertTrue(
            BookingStatusHistory.objects.filter(
                booking=booking,
                status=BookingStatus.PENDING,
            ).exists()
        )

    def test_unauthenticated_user_cannot_create_booking(self):
        response = self.client.post(
            reverse('create-booking'),
            {
                'property_id': self.other_listing.pk,
                'check_in_date': str(timezone.localdate() + timedelta(days=20)),
                'check_out_date': str(timezone.localdate() + timedelta(days=23)),
                'number_of_guests': 2,
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_booking_requires_property_id(self):
        self.client.force_authenticate(user=self.guest)

        response = self.client.post(
            reverse('create-booking'),
            {
                'check_in_date': str(timezone.localdate() + timedelta(days=20)),
                'check_out_date': str(timezone.localdate() + timedelta(days=23)),
                'number_of_guests': 2,
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('property_id', response.data)

    def test_create_booking_rejects_past_check_in_date(self):
        self.client.force_authenticate(user=self.guest)

        response = self.client.post(
            reverse('create-booking'),
            {
                'property_id': self.other_listing.pk,
                'check_in_date': str(timezone.localdate() - timedelta(days=1)),
                'check_out_date': str(timezone.localdate() + timedelta(days=2)),
                'number_of_guests': 2,
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('check_in_date', response.data)

    def test_create_booking_rejects_check_out_before_check_in(self):
        self.client.force_authenticate(user=self.guest)

        response = self.client.post(
            reverse('create-booking'),
            {
                'property_id': self.other_listing.pk,
                'check_in_date': str(timezone.localdate() + timedelta(days=10)),
                'check_out_date': str(timezone.localdate() + timedelta(days=9)),
                'number_of_guests': 2,
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('check_out_date', response.data)

    def test_create_booking_rejects_more_guests_than_listing_max(self):
        self.client.force_authenticate(user=self.guest)

        response = self.client.post(
            reverse('create-booking'),
            {
                'property_id': self.other_listing.pk,
                'check_in_date': str(timezone.localdate() + timedelta(days=20)),
                'check_out_date': str(timezone.localdate() + timedelta(days=23)),
                'number_of_guests': 10,
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('number_of_guests', response.data)

    def test_create_booking_rejects_own_property(self):
        self.client.force_authenticate(user=self.host)

        response = self.client.post(
            reverse('create-booking'),
            {
                'property_id': self.listing.pk,
                'check_in_date': str(timezone.localdate() + timedelta(days=20)),
                'check_out_date': str(timezone.localdate() + timedelta(days=23)),
                'number_of_guests': 2,
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('listing', response.data)

    def test_create_booking_rejects_overlapping_reservation(self):
        self.client.force_authenticate(user=self.other_guest)

        response = self.client.post(
            reverse('create-booking'),
            {
                'property_id': self.listing.pk,
                'check_in_date': str(timezone.localdate() + timedelta(days=6)),
                'check_out_date': str(timezone.localdate() + timedelta(days=8)),
                'number_of_guests': 2,
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)


class BookingPreInformationQuoteAPITests(BookingServiceAPITestCase):
    def test_can_obtain_total_price_and_unavailable_dates(self):
        response = self.client.post(
            reverse('obtain-total-price'),
            {
                'property_id': self.other_listing.pk,
                'check_in': str(timezone.localdate() + timedelta(days=20)),
                'check_out': str(timezone.localdate() + timedelta(days=23)),
                'guests': 2,
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_price', response.data)
        self.assertIn('unavailables_dates', response.data)
        self.assertEqual(Decimal(str(response.data['total_price'])), Decimal('450.00'))

    def test_preinformation_requires_property_id(self):
        response = self.client.post(
            reverse('obtain-total-price'),
            {
                'check_in': str(timezone.localdate() + timedelta(days=20)),
                'check_out': str(timezone.localdate() + timedelta(days=23)),
                'guests': 2,
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('property_id', response.data)

    def test_preinformation_rejects_invalid_date_range(self):
        response = self.client.post(
            reverse('obtain-total-price'),
            {
                'property_id': self.other_listing.pk,
                'check_in': str(timezone.localdate() + timedelta(days=23)),
                'check_out': str(timezone.localdate() + timedelta(days=20)),
                'guests': 2,
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('check_out_date', response.data)

    def test_preinformation_rejects_more_guests_than_listing_max(self):
        response = self.client.post(
            reverse('obtain-total-price'),
            {
                'property_id': self.other_listing.pk,
                'check_in': str(timezone.localdate() + timedelta(days=20)),
                'check_out': str(timezone.localdate() + timedelta(days=23)),
                'guests': 10,
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('guests', response.data)


class UserReservationsAPITests(BookingServiceAPITestCase):
    def test_authenticated_guest_can_list_only_own_reservations(self):
        other_booking = self.create_booking(
            listing=self.other_listing,
            guest=self.other_guest,
            check_in_days=15,
            check_out_days=17,
        )

        self.client.force_authenticate(user=self.guest)

        response = self.client.get(
            reverse('user-reservations'),
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_text = str(response.data)

        self.assertIn('Casa test', response_text)
        self.assertNotIn('Otra casa test', response_text)

        self.assertTrue(
            Booking.objects.filter(pk=other_booking.pk).exists()
        )


    def test_user_reservations_can_filter_by_search_term_on_listing_title(self):
        self.create_booking(
            listing=self.other_listing,
            guest=self.guest,
            check_in_days=15,
            check_out_days=17,
        )

        self.client.force_authenticate(user=self.guest)

        response = self.client.get(
            reverse('user-reservations'),
            {'search_term': 'Otra'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_text = str(response.data)

        self.assertIn('Otra casa test', response_text)
        self.assertNotIn('Casa test', response_text)

    def test_user_reservations_can_filter_by_search_term_on_listing_description(self):
        self.other_listing.title = 'Alojamiento sin coincidencia'
        self.other_listing.description = 'Descripción con palabra playa'
        self.other_listing.save()

        self.create_booking(
            listing=self.other_listing,
            guest=self.guest,
            check_in_days=15,
            check_out_days=17,
        )

        self.client.force_authenticate(user=self.guest)

        response = self.client.get(
            reverse('user-reservations'),
            {'search_term': 'playa'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_text = str(response.data)

        self.assertIn('Alojamiento sin coincidencia', response_text)
        self.assertNotIn('Casa test', response_text)

    def test_user_reservations_can_filter_by_actual_status(self):
        self.create_booking(
            listing=self.other_listing,
            guest=self.guest,
            check_in_days=15,
            check_out_days=17,
            status_value=BookingStatus.CANCELLED,
        )

        self.client.force_authenticate(user=self.guest)

        response = self.client.get(
            reverse('user-reservations'),
            {'actual_status': BookingStatus.CANCELLED},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_text = str(response.data)

        self.assertIn('Otra casa test', response_text)
        self.assertNotIn('Casa test', response_text)

    def test_user_reservations_can_combine_search_term_and_actual_status(self):
        self.create_booking(
            listing=self.other_listing,
            guest=self.guest,
            check_in_days=15,
            check_out_days=17,
            status_value=BookingStatus.CANCELLED,
        )

        self.client.force_authenticate(user=self.guest)

        response = self.client.get(
            reverse('user-reservations'),
            {
                'search_term': 'Otra',
                'actual_status': BookingStatus.CANCELLED,
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_text = str(response.data)

        self.assertIn('Otra casa test', response_text)
        self.assertNotIn('Casa test', response_text)

    def test_unauthenticated_user_cannot_list_user_reservations(self):
        response = self.client.get(
            reverse('user-reservations'),
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class HostReservationsAPITests(BookingServiceAPITestCase):
    def test_authenticated_host_can_list_reservations_of_own_properties(self):
        other_booking = self.create_booking(
            listing=self.other_listing,
            guest=self.other_guest,
            check_in_days=15,
            check_out_days=17,
        )

        self.client.force_authenticate(user=self.host)

        response = self.client.get(
            reverse('host-reservations'),
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_text = str(response.data)

        self.assertIn('Casa test', response_text)
        self.assertNotIn('Otra casa test', response_text)

        self.assertTrue(
            Booking.objects.filter(pk=other_booking.pk).exists()
        )


    def test_host_reservations_can_filter_by_search_term_on_listing_title(self):
        matching_listing = Listing.objects.create(
            owner=self.host,
            municipality=self.municipality,
            title='Apartamento con vista al mar',
            description='Descripción diferente',
            bedrooms=2,
            bathrooms=1,
            locationdesc='Ubicación vista',
            addresstext='Dirección vista',
            propertytype='Apartment',
            pricepernight=Decimal('180.00'),
            maxguests=4,
            exactlocation=Point(-74.08, 4.62, srid=4326),
        )

        self.create_booking(
            listing=matching_listing,
            guest=self.other_guest,
            check_in_days=15,
            check_out_days=17,
        )

        self.client.force_authenticate(user=self.host)

        response = self.client.get(
            reverse('host-reservations'),
            {'search_term': 'vista'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_text = str(response.data)

        self.assertIn('Apartamento con vista al mar', response_text)
        self.assertNotIn('Casa test', response_text)

    def test_host_reservations_can_filter_by_actual_status(self):
        cancelled_booking = self.create_booking(
            listing=self.listing,
            guest=self.other_guest,
            check_in_days=15,
            check_out_days=17,
            status_value=BookingStatus.CANCELLED,
        )

        self.client.force_authenticate(user=self.host)

        response = self.client.get(
            reverse('host-reservations'),
            {'actual_status': BookingStatus.CANCELLED},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_text = str(response.data)

        self.assertIn(str(cancelled_booking.booking_id), response_text)
        self.assertNotIn(str(self.booking.booking_id), response_text)

    def test_host_reservations_can_combine_search_term_and_actual_status(self):
        matching_listing = Listing.objects.create(
            owner=self.host,
            municipality=self.municipality,
            title='Cabaña familiar buscada',
            description='Descripción para filtro combinado',
            bedrooms=2,
            bathrooms=1,
            locationdesc='Ubicación familiar',
            addresstext='Dirección familiar',
            propertytype='Cabin',
            pricepernight=Decimal('180.00'),
            maxguests=4,
            exactlocation=Point(-74.08, 4.62, srid=4326),
        )

        self.create_booking(
            listing=matching_listing,
            guest=self.other_guest,
            check_in_days=15,
            check_out_days=17,
            status_value=BookingStatus.CANCELLED,
        )

        self.create_booking(
            listing=self.listing,
            guest=self.other_guest,
            check_in_days=18,
            check_out_days=20,
            status_value=BookingStatus.CANCELLED,
        )

        self.client.force_authenticate(user=self.host)

        response = self.client.get(
            reverse('host-reservations'),
            {
                'search_term': 'familiar',
                'actual_status': BookingStatus.CANCELLED,
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_text = str(response.data)

        self.assertIn('Cabaña familiar buscada', response_text)
        self.assertNotIn('Casa test', response_text)

    def test_unauthenticated_user_cannot_list_host_reservations(self):
        response = self.client.get(
            reverse('host-reservations'),
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_non_host_user_gets_empty_host_reservation_list_if_no_properties(self):
        self.client.force_authenticate(user=self.guest)

        response = self.client.get(
            reverse('host-reservations'),
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)