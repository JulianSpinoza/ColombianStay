from rest_framework import serializers
from .models import Listing, Region, Department, Municipality
from django.db.models import Avg
from rating_service.models import Rating
from rest_framework import serializers

from .models import Listing, ListingImage
from rating_service.serializers import RatingSerializer


class ListingImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = ListingImage
        fields = ["id", "image_url", "thumbnail_url", "is_main"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_thumbnail_url(self, obj):
        request = self.context.get("request")
        if obj.thumbnail:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None
    

class ListingSerializer(serializers.ModelSerializer):
    images = ListingImageSerializer(many=True, read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Listing
        fields = [
            "accomodationid",
            "owner",
            "municipality",
            "title",
            "description",
            "locationdesc",
            "addresstext",
            "propertytype",
            "pricepernight",
            "images",
            "reviews_count",
            "average_rating",
        ]
        read_only_fields = ["accomodationid"]

class ListingDetailSerializer(serializers.ModelSerializer):
    images = ListingImageSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source="owner.username", read_only=True)
    reviews = serializers.SerializerMethodField()
    reviews_count = serializers.IntegerField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    share_path = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "accomodationid",
            "owner",
            "owner_name",
            "municipality",
            "title",
            "description",
            "bedrooms",
            "bathrooms",
            "locationdesc",
            "addresstext",
            "propertytype",
            "pricepernight",
            "maxguests",
            "images",
            "reviews",
            "reviews_count",
            "average_rating",
            "share_path",
        ]
        read_only_fields = ["accomodationid"]

    def get_reviews(self, obj):
        ratings = Rating.objects.filter(
            booking__listing=obj
        ).select_related(
            'booking__guest'
        )

        return RatingSerializer(
            ratings,
            many=True
        ).data

    def get_share_path(self, obj):
        return f"/listings/{obj.accomodationid}"


class PublishListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = [
            'accomodationid',
            'municipality',
            'title',
            'description',
            'bedrooms',
            'bathrooms',
            'locationdesc',
            'addresstext',
            'propertytype',
            'pricepernight',
            'maxguests',
        ]
        read_only_fields = ['accomodationid']
        extra_kwargs = {
            'pricepernight': {'min_value': 0},
            'bedrooms': {'min_value': 1},
            'bathrooms': {'min_value': 1},
            'maxguests': {'min_value': 1},
        }

    def validate_title(self, value):
        return value.strip()

    def validate_description(self, value):
        return value.strip()

    def validate_locationdesc(self, value):
        return value.strip()

    def validate_addresstext(self, value):
        return value.strip()

    def validate(self, attrs):
        if attrs['maxguests'] < attrs['bedrooms']:
            raise serializers.ValidationError({
                'maxguests': 'El máximo de huéspedes no puede ser menor que la cantidad de habitaciones.'
            })

        if attrs['title'].lower() == attrs['description'].lower():
            raise serializers.ValidationError({
                'description': 'La descripción no debe ser igual al título.'
            })

        request = self.context.get('request')
        owner = getattr(request, 'user', None)

        if owner and owner.is_authenticated:
            duplicated = Listing.objects.filter(
                owner=owner,
                municipality=attrs['municipality'],
                title__iexact=attrs['title'].strip(),
                addresstext__iexact=attrs['addresstext'].strip(),
            ).exists()

            if duplicated:
                raise serializers.ValidationError({
                    'non_field_errors': [
                        'Ya existe una publicación con el mismo usuario, municipio, título y dirección.'
                    ]
                })

        return attrs
    
class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['regionid', 'name']

class DepartmentSerializer(serializers.ModelSerializer):
    region = RegionSerializer(read_only=True)

    class Meta:
        model = Department
        fields = ['departmentid', 'name', 'region']

class MunicipalitySerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)

    class Meta:
        model = Municipality
        fields = ['municipalityid', 'name', 'department']

