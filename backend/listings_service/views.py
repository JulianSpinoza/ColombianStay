from django.db import transaction, IntegrityError
from users_service.serializers import UserRegisterSerializer
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Region, Department, Municipality, Listing
from .serializers import ListingSerializer, PublishListingSerializer, RegionSerializer, DepartmentSerializer, MunicipalitySerializer, ListingFilterSerializer
    
class ListingListView(generics.ListAPIView):
    serializer_class = ListingSerializer

    def get_queryset(self):
        qs = Listing.objects.select_related(
            'municipality',
            'municipality__department',
            'municipality__department__region',
            'owner',
        ).all()

        name_municipality = self.request.query_params.get('municipality')

        if name_municipality:
            qs = qs.filter(municipality__name__iexact=name_municipality)

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
    
class ListingSearchView(generics.ListAPIView):
    serializer_class = ListingSerializer

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

        print(str(filters_data.get('municipality')))

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
            queryset = queryset.filter(propertytype=propertytype)

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

        print(str(queryset.query))

        return queryset.order_by('-accomodationid')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        applied_filters = {}
        for key, value in request.query_params.items():
            if value not in [None, '']:
                applied_filters[key] = value

        base_url = request.build_absolute_uri(request.path)

        clear_one_examples = {
            key: self._build_url_without_param(request, key)
            for key in applied_filters.keys()
        }

        clear_all_url = base_url

        return Response({
            'count': queryset.count(),
            'applied_filters': applied_filters,
            'clear_one_filter_urls': clear_one_examples,
            'clear_all_filters_url': clear_all_url,
            'results': serializer.data
        })

    def _build_url_without_param(self, request, param_to_remove):
        querydict = request.query_params.copy()
        querydict.pop(param_to_remove, None)

        base_url = request.build_absolute_uri(request.path)
        query_string = querydict.urlencode()

        if query_string:
            return f'{base_url}?{query_string}'
        return base_url