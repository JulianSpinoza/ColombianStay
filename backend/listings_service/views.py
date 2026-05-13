from django.db import transaction, IntegrityError
from core.pagination import ListingPagination
from users_service.serializers import UserRegisterSerializer
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Region, Department, Municipality, Listing
from .serializers import ListingImageSerializer, ListingSerializer, ListingDetailSerializer, PublishListingSerializer
from .serializers import RegionSerializer, DepartmentSerializer, MunicipalitySerializer

from django.db.models import Avg, Count
from django.db.models import Q, F
from itertools import chain
    
class ListingListView(generics.ListAPIView):
    serializer_class = ListingSerializer
    pagination_class = ListingPagination

    def get_queryset(self):
        qs = (
            Listing.objects
            .select_related("owner", "municipality")
            .prefetch_related("images", "bookings__guest")
            .all()
        )

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
    
class LocationUnifiedView(APIView):

    def get(self, request):

        regions = Region.objects.values(
            id=F('regionid'),
            name_of_location=F('name')
        )
        for r in regions:
            r["type"] = "Region"

        departments = Department.objects.values(
            id=F('departmentid'),
            name_of_location=F('name')
        )
        for d in departments:
            d["type"] = "Departamento"

        municipalities = Municipality.objects.values(
            id=F('municipalityid'),
            name_of_location=F('name')
        )
        for m in municipalities:
            m["type"] = "Municipio"

        data = list(chain(regions, departments, municipalities))

        return Response(data)
    
class PublishProperty(APIView):

    parser_classes = [MultiPartParser, FormParser]
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
    
class ListingSearchView(generics.ListAPIView):
    serializer_class = ListingSerializer
    pagination_class = ListingPagination

    def get_queryset(self):
        queryset = Listing.objects.select_related(
            'owner',
            'municipality',
            'municipality__department',
            'municipality__department__region'
        ).all()

        self.filter_serializer = ListingFilterSerializer(
            data=self.request.query_params
        )
        self.filter_serializer.is_valid(raise_exception=True)
        filters_data = self.filter_serializer.validated_data

        keyword = filters_data.get('keyword')
        region = filters_data.get('region')
        department = filters_data.get('department')
        municipality = filters_data.get('municipality')
        propertytype = filters_data.get('propertytype')
        min_price = filters_data.get('min_price')
        max_price = filters_data.get('max_price')
        bedrooms = filters_data.get('bedrooms')
        bathrooms = filters_data.get('bathrooms')
        maxguests = filters_data.get('maxguests')

        if keyword:
            queryset = queryset.filter(
                Q(title__icontains=keyword) |
                Q(description__icontains=keyword)
            )

        if region:
            queryset = queryset.filter(
                municipality__department__region=region
            )

        if department:
            queryset = queryset.filter(
                municipality__department=department
            )

        if municipality:
            queryset = queryset.filter(
                municipality=municipality
            )

        if propertytype:
            queryset = queryset.filter(propertytype__iexact=propertytype)

        if min_price is not None:
            queryset = queryset.filter(pricepernight__gte=min_price)

        if max_price is not None:
            queryset = queryset.filter(pricepernight__lte=max_price)

        if bedrooms is not None:
            queryset = queryset.filter(bedrooms__gte=bedrooms)      # Mayor o igual a 
            # queryset = queryset.filter(bedrooms=bedrooms)         # Igual a 

        if bathrooms is not None:
            queryset = queryset.filter(bathrooms__gte=bathrooms)    # Mayor o igual a 
            # queryset = queryset.filter(bathrooms=bathrooms)       # Igual a 

        if maxguests is not None:
            queryset = queryset.filter(maxguests__gte=maxguests)    # Mayor o igual a 
            # queryset = queryset.filter(maxguests=maxguests)       # Igual a 

        #print(str(queryset.query))

        return queryset.order_by('-accomodationid')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page_queryset = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page_queryset, many=True)

        applied_filters = {}

        for key, value in request.query_params.items():
            if value not in [None, ''] and key not in ['page']:
                applied_filters[key] = value

        base_url = request.build_absolute_uri(request.path)

        clear_one_examples = {
            key: self._build_url_without_param(request, key)
            for key in applied_filters.keys()
        }

        clear_all_url = base_url

        paginated_response = self.get_paginated_response(serializer.data)

        paginated_response.data.update({
            'total_pages': self.paginator.page.paginator.num_pages,
            'applied_filters': applied_filters,
            'clear_one_filter_urls': clear_one_examples,
            'clear_all_filters_url': clear_all_url,
            'suggestions': self._get_suggestions_data(),
        })

        return paginated_response

    def _build_url_without_param(self, request, param_to_remove):
        querydict = request.query_params.copy()
        querydict.pop(param_to_remove, None)

        base_url = request.build_absolute_uri(request.path)
        query_string = querydict.urlencode()

        if query_string:
            return f'{base_url}?{query_string}'
        return base_url
    
    def _get_suggestions_data(self):
        suggestions_qs = Listing.objects.select_related(
            'owner', 
            'municipality', 
            'municipality__department', 
            'municipality__department__region'
        ).all().order_by('-accomodationid')[:4]
        
        serializer = self.get_serializer(suggestions_qs, many=True)
        return serializer.data