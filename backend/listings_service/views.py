from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg

from .models import Municipality, Listing, Rating
from .serializers import ListingSerializer, RatingSerializer, PublishListingSerializer


class ListingListView(generics.ListAPIView):
    
    serializer_class = ListingSerializer

    # select_related to INNER JOIN the user model
    #queryset = Listing.objects.select_related('user').all()

    def get_queryset(self):
        qs = Listing.objects.all()
        nameMunicipality = self.request.query_params.get('municipality', None)
        
        if nameMunicipality is not None:

            m = Municipality.objects.get(name=nameMunicipality)
            
            try:
                qs = qs.filter(
                    municipality=m.municipalityid
                )
            except ValueError:
                # Left to insert some log
                print('Error!!!!')
                return qs.none()

        return qs

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
        if not request.user or not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Obtener todas las propiedades del host
        host_listings = Listing.objects.filter(user=request.user)
        
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
    
class PublishProperty(APIView):
    def post(self, request):
        # Pasr municipality de name a id
        print(f"Datos recibidos: {request.data}")
        print(f"Usuario recibido: {request.user}")
        property = request.data
        try:
            city = Municipality.objects.get(name=property.pop('city'))
        except Municipality.DoesNotExist:
            print("Error: Municipality could not be found")
        except Municipality.MultipleObjectsReturned:
            print("Error: Multiple municipalities found")
        else:
            print(f"Id ciudad:{city}")
            serializer = PublishListingSerializer(data=property)
            if serializer.is_valid():
                serializer.save(owner=request.user,municipality=city)
                return Response(
                    {
                        "message": "Property created successfully.",
                    },
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
