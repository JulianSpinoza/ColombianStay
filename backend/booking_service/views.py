from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404

from listings_service.models import Listing
from .models import Booking, BookingStatus, Actuator
from .serializers import (
    CreateBookingSerializer,
    BookingSerializer,
    BookingTotalPriceSerializer,
)


class HostReservationsView(generics.ListAPIView):
    """
    Vista para obtener todas las reservas de las propiedades del host autenticado.
    """
    serializer_class = BookingSerializer

    def get_queryset(self):
        if not self.request.user or not self.request.user.is_authenticated:
            return Booking.objects.none()

        host_listings = Listing.objects.filter(owner=self.request.user)

        return Booking.objects.filter(
            listing__in=host_listings
        ).order_by("-created_at")

    def list(self, request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response(
                {"error": "Autenticación requerida. Por favor, inicia sesión."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return super().list(request, *args, **kwargs)


class CreateBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data

        listing_id = data.get("property_id") or data.get("listing")

        if not listing_id:
            return Response(
                {"property_id": ["Este campo es obligatorio."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        listing = get_object_or_404(Listing, pk=listing_id)

        normalized_data = {
            "check_in_date": data.get("check_in_date"),
            "check_out_date": data.get("check_out_date"),
            "number_of_guests": data.get("number_of_guests"),
        }

        with transaction.atomic():
            listing = Listing.objects.select_for_update().filter(pk=listing_id).first()

            if not listing:
                return Response(
                    {"detail": "Propiedad no encontrada."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            serializer = CreateBookingSerializer(
                data=normalized_data,
                context={
                    "request": request,
                    "listing": listing,
                },
            )

            serializer.is_valid(raise_exception=True)

            booking = serializer.save()

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )


class BookingPreInformationQuoteView(APIView):
    def post(self, request):
        data = request.data

        listing_id = data.get("property_id") or data.get("listing")

        if not listing_id:
            return Response(
                {"property_id": ["Este campo es obligatorio."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        listing = get_object_or_404(Listing, pk=listing_id)

        normalized_data = {
            "check_in_date": data.get("check_in"),
            "check_out_date": data.get("check_out"),
            "guests": data.get("guests"),
        }

        serializer = BookingTotalPriceSerializer(
            data=normalized_data,
            context={
                "listing": listing,
            },
        )

        if serializer.is_valid():
            total_price = serializer.calculate_total()
            unavailables_dates = listing.get_unavailable_dates()

            return Response(
                {
                    "total_price": total_price,
                    "unavailables_dates": unavailables_dates,
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserReservationsView(generics.ListAPIView):
    """
    Lista las reservas del usuario autenticado como huésped.
    """
    serializer_class = BookingSerializer

    def get_queryset(self):
        if not self.request.user or not self.request.user.is_authenticated:
            return Booking.objects.none()

        return Booking.objects.filter(
            guest=self.request.user
        ).order_by("-created_at")

    def list(self, request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response(
                {"error": "Autenticación requerida."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return super().list(request, *args, **kwargs)


class CancelReservationView(APIView):
    """
    Cancela una reserva y guarda el motivo de cancelación
    en BookingStatusHistory.desc_of_transaction.
    """

    def patch(self, request, pk):
        if not request.user or not request.user.is_authenticated:
            return Response(
                {"error": "Autenticación requerida."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        booking = get_object_or_404(Booking, pk=pk)

        is_guest = booking.guest == request.user
        is_owner = booking.listing.owner == request.user

        if not (is_guest or is_owner):
            return Response(
                {"error": "No autorizado"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if booking.actual_status == BookingStatus.CANCELLED:
            return Response(
                {"error": "La reserva ya se encuentra cancelada."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cancellation_reason = (
            request.data.get("cancellation_reason")
            or request.data.get("reason")
            or ""
        ).strip()

        if not cancellation_reason:
            return Response(
                {"cancellation_reason": ["El motivo de cancelación es obligatorio."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        principal_actuator = Actuator.GUEST if is_guest else Actuator.HOST

        booking.update_status(
            BookingStatus.CANCELLED,
            desc_of_transaction=cancellation_reason,
            principal_actuator=principal_actuator,
        )

        return Response(
            {
                "message": "Reserva cancelada correctamente.",
                "booking_id": booking.booking_id,
                "actual_status": booking.actual_status,
                "status": booking.actual_status.lower(),
                "cancellation_reason": cancellation_reason,
                "principal_actuator": principal_actuator,
            },
            status=status.HTTP_200_OK,
        )