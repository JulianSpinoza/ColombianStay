from users_service.serializers import UserRegisterSerializer
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Municipality, Listing
from .serializers import ListingSerializer, PublishListingSerializer
    
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

class ListingDetailView(generics.RetrieveAPIView):
    """Detalle de un listing por pk (accomodationid)."""
    serializer_class = ListingSerializer
    lookup_field = 'pk'
    queryset = Listing.objects.all()
    
class PublishProperty(APIView):
    def post(self, request):
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
            serializeruser = UserRegisterSerializer(data=request.user)
            if serializer.is_valid():

                serializer.save(owner=request.user,municipality=city)
                serializeruser.update_host_status(is_host=True, user=request.user)
                return Response(
                    {
                        "message": "Property created successfully.",
                    },
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)