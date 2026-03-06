from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Booking
from .serializers import BookingSerializer

from django.shortcuts import get_object_or_404

from listings_service.models import Listing

class HostReservationsView(generics.ListAPIView):
    """
    Vista para obtener todas las reservas de las propiedades del host autenticado.
    Sin usar rest_framework.permissions, validación manual en el método list().
    """
    serializer_class = BookingSerializer
    
    def get_queryset(self):
        """Filtrar reservas por propiedades del host autenticado"""
        if not self.request.user or not self.request.user.is_authenticated:
            return Booking.objects.none()
        
        # Obtener todas las propiedades del host
        host_listings = Listing.objects.filter(owner=self.request.user)
        # Retornar reservas de esas propiedades
        return Booking.objects.filter(listing__in=host_listings).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """Override del método list para validación manual de autenticación"""
        # Validación manual sin usar rest_framework.permissions
        if not request.user or not request.user.is_authenticated:
            return Response(
                {'error': 'Autenticación requerida. Por favor, inicia sesión.'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        return super().list(request, *args, **kwargs)


class CreateBookingView(APIView):
    """Crear una nueva reserva (booking) por el usuario autenticado.
    Validación manual de autenticación sin usar rest_framework.permissions.
    """
    def post(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({'error': 'Autenticación requerida.'}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data

        # Aceptar 'property_id' o 'listing' en el payload
        listing_id = data.get('property_id') or data.get('listing')
        if not listing_id:
            return Response({'error': 'Missing property_id/listing'}, status=status.HTTP_400_BAD_REQUEST)

        # Obtener el listing
        listing = get_object_or_404(Listing, pk=listing_id)

        # Extraer campos mínimos
        try:
            check_in = data.get('start_date') or data.get('check_in_date')
            check_out = data.get('end_date') or data.get('check_out_date')
            guests = int(data.get('guests') or data.get('number_of_guests') or 1)
            total_price = data.get('total_price')
        except (ValueError, TypeError):
            return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)

        booking = Booking.objects.create(
            listing=listing,
            guest=request.user,
            check_in_date=check_in,
            check_out_date=check_out,
            number_of_guests=guests,
            total_price=total_price,
            status=data.get('status', 'confirmed')
        )

        serializer = BookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserReservationsView(generics.ListAPIView):
    """Lista las reservas del usuario autenticado (guest).
    Validación manual de autenticación en `list()`.
    """
    serializer_class = BookingSerializer

    def get_queryset(self):
        if not self.request.user or not self.request.user.is_authenticated:
            return Booking.objects.none()
        return Booking.objects.filter(guest=self.request.user).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response({'error': 'Autenticación requerida.'}, status=status.HTTP_401_UNAUTHORIZED)
        return super().list(request, *args, **kwargs)


class CancelReservationView(APIView):
    """Patch endpoint to cancel a reservation. Validates that the requester
    is either the guest who made the booking or the owner of the listing."""
    def patch(self, request, pk):
        if not request.user or not request.user.is_authenticated:
            return Response({'error': 'Autenticación requerida.'}, status=status.HTTP_401_UNAUTHORIZED)

        booking = get_object_or_404(Booking, pk=pk)

        # Only guest or listing owner can cancel
        is_guest = booking.guest == request.user
        is_owner = booking.listing.owner == request.user
        if not (is_guest or is_owner):
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)

        booking.status = 'cancelled'
        booking.save()

        return Response({'message': 'Reserva cancelada'}, status=status.HTTP_200_OK)

