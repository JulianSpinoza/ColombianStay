from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from listings_service.models import Listing
from .models import Booking, BookingStatus, Actuator
from .serializers import (
    CreateBookingSerializer,
    BookingSerializer,
    BookingTotalPriceSerializer,
    CancelBookingSerializer,
)

MIN_GUEST_CANCELLATION_DAYS = 3

def user_is_host(user):
    """
    Determina si el usuario autenticado puede actuar como host.

    Ajusta esta función según cómo tu CustomUser maneje roles.
    Soporta varios escenarios comunes:
    - user.is_host = True
    - user.role = 'HOST'
    - user.user_type = 'HOST'
    - user.type = 'HOST'
    - grupo de Django llamado 'host'
    """

    if not user or not user.is_authenticated:
        return False

    if getattr(user, 'is_host', False):
        return True

    for attr in ['role', 'user_type', 'type']:
        value = getattr(user, attr, None)

        if isinstance(value, str) and value.upper() == 'HOST':
            return True

        if hasattr(value, 'name') and str(value.name).upper() == 'HOST':
            return True

    if hasattr(user, 'groups'):
        return user.groups.filter(name__iexact='host').exists()

    return False

class HostReservationsView(generics.ListAPIView):
    """
    Vista para obtener todas las reservas de las propiedades
    del host autenticado.
    """

    serializer_class = BookingSerializer

    def get_queryset(self):
        if not self.request.user or not self.request.user.is_authenticated:
            return Booking.objects.none()


        return (
            Booking.objects
            .select_related(
                "listing",
                "listing__owner",
                "guest",
            )
            .filter(
                listing__owner=self.request.user
            )
            .order_by("-created_at")
        )


    def list(self, request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response(
                {
                    'error': 'Autenticación requerida. Por favor, inicia sesión.'
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        return super().list(request, *args, **kwargs)

class CreateBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data

        listing_id = data.get('property_id') or data.get('listing')

        if not listing_id:
            return Response(
                {'property_id': ['Este campo es obligatorio.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            listing = Listing.objects.select_for_update().filter(
                pk=listing_id
            ).first()

            if not listing:
                return Response(
                    {'detail': 'Propiedad no encontrada.'},
                    status=status.HTTP_404_NOT_FOUND
                )

            normalized_data = {
                'check_in_date': data.get('check_in_date'),
                'check_out_date': data.get('check_out_date'),
                'number_of_guests': data.get('number_of_guests'),
            }

            serializer = CreateBookingSerializer(
                data=normalized_data,
                context={
                    'request': request,
                    'listing': listing,
                }
            )

            serializer.is_valid(raise_exception=True)

            booking = serializer.save()

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED
        )

class BookingPreInformationQuoteView(APIView):
    def post(self, request):
        data = request.data

        listing_id = data.get('property_id') or data.get('listing')

        if not listing_id:
            return Response(
                {'property_id': ['Este campo es obligatorio.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        listing = get_object_or_404(Listing, pk=listing_id)

        normalized_data = {
            'check_in_date': data.get('check_in'),
            'check_out_date': data.get('check_out'),
            'guests': data.get('guests'),
        }

        serializer = BookingTotalPriceSerializer(
            data=normalized_data,
            context={
                'listing': listing,
            }
        )

        if serializer.is_valid():
            total_price = serializer.calculate_total()
            unavailables_dates = listing.get_unavailable_dates()

            return Response(
                {
                    'total_price': total_price,
                    'unavailables_dates': unavailables_dates,
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class UserReservationsView(generics.ListAPIView):
    """
    Lista las reservas del usuario autenticado como guest.
    """

    serializer_class = BookingSerializer

    def get_queryset(self):
        if not self.request.user or not self.request.user.is_authenticated:
            return Booking.objects.none()

        return (
            Booking.objects
            .select_related(
                "listing",
                "guest",
            )
            .filter(
                guest=self.request.user
            )
            .order_by("-created_at")
        )


    def list(self, request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response(
                {'error': 'Autenticación requerida.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return super().list(request, *args, **kwargs)

class GuestCancelReservationView(APIView):
    """
    Cancela una reserva desde la perspectiva del huésped.

    Requisitos:
    - Solo el guest dueño de la reserva puede cancelarla.
    - La cancelación solo puede hacerse mínimo 3 días antes
      de la fecha inicial/check-in.
    - La cancelación debe venir con un motivo escrito.
    - El cambio de estado debe guardarse en BookingStatusHistory.
    - El historial debe indicar que canceló el guest y guardar el motivo.
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        serializer = CancelBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reason = serializer.validated_data['reason']

        with transaction.atomic():
            booking = get_object_or_404(
                Booking.objects.select_for_update().select_related(
                    'guest'
                ),
                pk=pk
            )

            if booking.guest_id != request.user.id:
                return Response(
                    {
                        'error': (
                            'No autorizado. Solo el huésped de la reserva '
                            'puede cancelarla.'
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            if booking.actual_status == BookingStatus.CANCELLED:
                return Response(
                    {'error': 'La reserva ya está cancelada.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            today = timezone.localdate()
            days_before_check_in = (
                booking.check_in_date - today
            ).days

            if days_before_check_in < MIN_GUEST_CANCELLATION_DAYS:
                return Response(
                    {
                        'error': (
                            'La reserva solo puede cancelarse mínimo '
                            '3 días antes de la fecha inicial.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            booking.update_status(
                new_status=BookingStatus.CANCELLED,
                principal_actuator=Actuator.GUEST,
                desc_of_transaction=(
                    f'Reserva cancelada por el huésped. Motivo: {reason}'
                )
            )

        return Response(
            {'message': 'Reserva cancelada por el huésped.'},
            status=status.HTTP_200_OK
        )

class HostCancelReservationView(APIView):
    """
    Cancela una reserva desde la perspectiva del anfitrión.

    Requisitos:
    - El usuario autenticado debe ser host.
    - Solo puede cancelar reservas de sus propias propiedades.
    - La cancelación debe venir con un motivo escrito.
    - El cambio de estado debe guardarse en BookingStatusHistory.
    - El historial debe indicar que canceló el host y guardar el motivo.
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not user_is_host(request.user):
            return Response(
                {
                    'error': (
                        'No autorizado. El usuario autenticado no es anfitrión.'
                    )
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = CancelBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reason = serializer.validated_data['reason']

        with transaction.atomic():
            booking = get_object_or_404(
                Booking.objects.select_for_update().select_related(
                    'listing',
                    'listing__owner',
                ),
                pk=pk
            )

            if booking.listing.owner_id != request.user.id:
                return Response(
                    {
                        'error': (
                            'No autorizado. Solo el anfitrión de la propiedad '
                            'puede cancelarla.'
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            if booking.actual_status == BookingStatus.CANCELLED:
                return Response(
                    {'error': 'La reserva ya está cancelada.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            booking.update_status(
                new_status=BookingStatus.CANCELLED,
                principal_actuator=Actuator.HOST,
                desc_of_transaction=(
                    f'Reserva cancelada por el anfitrión. Motivo: {reason}'
                )
            )

        return Response(
            {'message': 'Reserva cancelada por el anfitrión.'},
            status=status.HTTP_200_OK
        )