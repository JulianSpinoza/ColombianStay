from django.db import transaction, IntegrityError
from users_service.serializers import UserRegisterSerializer
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Region, Department, Municipality, Listing
from .serializers import ListingSerializer, ListingDetailSerializer, PublishListingSerializer
from .serializers import RegionSerializer, DepartmentSerializer, MunicipalitySerializer

from django.db.models import Avg, Count
    
class ListingListView(generics.ListAPIView):
    serializer_class = ListingSerializer

    def get_queryset(self):
        qs = (
            Listing.objects
            .select_related("owner", "municipality")
            .prefetch_related("images", "bookings__guest")
            .all()
        )

        name_municipality = self.request.query_params.get('municipality')

        if name_municipality:
            qs = qs.filter(municipality__name__iexact=name_municipality)

        return qs
    
class RegionListView(generics.ListAPIView):
    
    serializer_class = RegionSerializer

    def get_queryset(self):
        qs = Region.objects.all()

        return qs


class ListingDetailView(generics.RetrieveAPIView):
    serializer_class = ListingDetailSerializer
    lookup_field = "pk"

    def get_queryset(self):
        return (
            Listing.objects
            .select_related(
                "owner",
                "municipality"
            )
            .prefetch_related(
                "images",
                "bookings__review",
                "bookings__guest"
            )
            .annotate(
                reviews_count=Count(
                    "bookings__review",
                    distinct=True
                ),
                average_rating=Avg(
                    "bookings__review__rating"
                )
            )
        )
    
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