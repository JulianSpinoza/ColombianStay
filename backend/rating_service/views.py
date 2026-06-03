from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError

from django.db.models import Avg

from .models import Rating
from .serializers import CreateRatingSerializer, RatingSerializer

from listings_service.models import Listing
from booking_service.models import Booking, BookingStatus

class CreateRatingView(generics.CreateAPIView):
    serializer_class = CreateRatingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        booking_id = self.kwargs['booking_id']

        try:
            booking = Booking.objects.get(pk=booking_id)
        except Booking.DoesNotExist:
            raise ValidationError(
                {"booking": "La reserva no existe."}
            )

        # Solo el huésped propietario puede calificar
        if booking.guest != self.request.user:
            raise PermissionDenied(
                "No puede calificar una reserva que no le pertenece."
            )

        # Debe estar completada
        if booking.actual_status != BookingStatus.COMPLETED:
            raise ValidationError(
                {"booking": "Solo se pueden calificar reservas completadas."}
            )

        # Evitar doble calificación
        if hasattr(booking, 'review'):
            raise ValidationError(
                {"booking": "Esta reserva ya fue calificada."}
            )

        serializer.save(booking=booking)

class HostRatingsView(generics.ListAPIView):
    #Vista para obtener todos los ratings de las propiedades del host que está ctualmente
    serializer_class = RatingSerializer
    
    def get_queryset(self):
        #nos trae los ratings del usuario host autenticado
        if not self.request.user or not self.request.user.is_authenticated:
            return Rating.objects.none()
        
        host_listings = Listing.objects.filter(user=self.request.user)
        return Rating.objects.filter(listing__in=host_listings).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        # if not request.user or not request.user.is_authenticated:
        #     print("Usuario no autenticado")
        #     return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        # Obtener todas las propiedades del host
        print("Usuario autenticado:", request.user)
        host_listings = Listing.objects.filter(owner=request.user)
        
        ratings_data = []
        for listing in host_listings:
            listing_ratings = Rating.objects.filter(listing=listing)
            avg_rating = listing_ratings.aggregate(Avg('rating'))['rating__avg']
            
            ratings_data.append({
                'listing_id': listing.accomodationid,
                'listing_title': listing.title,
                'average_rating': avg_rating if avg_rating else 0,
                'rating_count': listing_ratings.count(),
                'ratings': RatingSerializer(listing_ratings, many=True).data
            })
        
        return Response(ratings_data)
