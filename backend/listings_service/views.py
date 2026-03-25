from django.db import transaction, IntegrityError
from users_service.serializers import UserRegisterSerializer
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Region, Department, Municipality, Listing
from .serializers import ListingSerializer, PublishListingSerializer, RegionSerializer, DepartmentSerializer, MunicipalitySerializer
    
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
    
class RegionListView(generics.ListAPIView):
    
    serializer_class = RegionSerializer

    def get_queryset(self):
        qs = Region.objects.all()

        return qs
    
class DepartmentListView(generics.ListAPIView):
    
    serializer_class = DepartmentSerializer

    def get_queryset(self):
        region_id = self.kwargs['region_id']
        qs = Department.objects.filter(region_id=region_id)

        return qs
    
class MunicipalityListView(generics.ListAPIView):
    
    serializer_class = MunicipalitySerializer

    def get_queryset(self):
        department_id = self.kwargs['department_id']
        qs = Municipality.objects.filter(department_id=department_id)

        return qs
    
class ListingDetailView(generics.RetrieveAPIView):
    """Detalle de un listing por pk (accomodationid)."""
    serializer_class = ListingSerializer
    lookup_field = 'pk'
    queryset = Listing.objects.all()
    
class PublishProperty(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PublishListingSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                serializer.save(owner=request.user)

                if not request.user.is_host:
                    request.user.is_host = True
                    request.user.save(update_fields=['is_host'])

        except IntegrityError:
            return Response(
                {
                    'message': 'Ya existe una esta publicación para este usuario.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "message": "Property created successfully.",
            },
            status=status.HTTP_201_CREATED
        )