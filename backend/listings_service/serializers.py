from rest_framework import serializers
from .models import Listing, ListingImage, Region, Department, Municipality
from django.db.models import Avg, Q
from django.contrib.gis.geos import Point
from rating_service.models import Rating
from rating_service.serializers import RatingSerializer

import json

class LocationField(serializers.Field):

    def to_representation(self, value):

        if not value:
            return None

        return {
            "lat": value.y,
            "lng": value.x
        }

    def to_internal_value(self, data):

        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                raise serializers.ValidationError(
                    "Formato inválido de localización."
                )

        try:
            lat = float(data["lat"])
            lng = float(data["lng"])

        except (KeyError, TypeError, ValueError):

            raise serializers.ValidationError(
                "Formato inválido de localización."
            )

        if not (-90 <= lat <= 90):
            raise serializers.ValidationError(
                "Latitud inválida."
            )

        if not (-180 <= lng <= 180):
            raise serializers.ValidationError(
                "Longitud inválida."
            )

        return Point(lng, lat, srid=4326)


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
    exactlocation = LocationField()

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
            "exactlocation"
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

    exactlocation = LocationField()
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True
    )

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
            'exactlocation',
            'images'
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
                exactlocation=attrs['exactlocation'],
                title__iexact=attrs['title'].strip(),
                addresstext__iexact=attrs['addresstext'].strip(),
            ).exists()

            if duplicated:
                raise serializers.ValidationError({
                    'non_field_errors': [
                        'Ya existe una publicación con el mismo usuario, municipio, título y dirección.'
                    ]
                })
            
            municipality = attrs.get("municipality")
            exactlocation = attrs.get("exactlocation")

            if municipality and exactlocation: 

                if not municipality.boundary.contains(exactlocation):
                    raise serializers.ValidationError({
                        "exactlocation": (
                            "La ubicación no pertenece al municipio."
                        )
                    })


        return attrs
    
    def create(self, validated_data):

        images_data = validated_data.pop("images")

        listing = Listing.objects.create(
            **validated_data
        )

        for image_data in images_data:

            ListingImage.objects.create(
                listing=listing,
                image=image_data
            )

        return listing

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['regionid', 'name']

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['departmentid', 'name']

class MunicipalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Municipality
        fields = ['municipalityid', 'name']

class ListingFilterSerializer(serializers.Serializer):
    keyword = serializers.CharField(required=False, allow_blank=False)
    region_id = serializers.PrimaryKeyRelatedField(
        queryset=Region.objects.all(),
        source='region',
        required=False
    )
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        required=False
    )
    municipality_id = serializers.PrimaryKeyRelatedField(
        queryset=Municipality.objects.all(),
        source='municipality',
        required=False
    )
    propertytype = serializers.ChoiceField(
        choices=Listing.PropertyType.choices,
        required=False
    )
    min_price = serializers.IntegerField(required=False, min_value=0)
    max_price = serializers.IntegerField(required=False, min_value=0)
    bedrooms = serializers.IntegerField(required=False, min_value=1)
    bathrooms = serializers.IntegerField(required=False, min_value=1)
    maxguests = serializers.IntegerField(required=False, min_value=1)

    def validate_keyword(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('La palabra clave no puede estar vacía.')
        return value

    def validate(self, attrs):
        min_price = attrs.get('min_price')
        max_price = attrs.get('max_price')

        if min_price is not None and max_price is not None and min_price > max_price:
            raise serializers.ValidationError({
                'min_price': 'El precio mínimo no puede ser mayor que el precio máximo.',
                'max_price': 'El precio máximo no puede ser menor que el precio mínimo.'
            })

        region = attrs.get('region')
        department = attrs.get('department')
        municipality = attrs.get('municipality')

        if department and region and department.region_id != region.regionid:
            raise serializers.ValidationError({
                'department_id': 'El departamento no pertenece a la región seleccionada.'
            })

        if municipality and department and municipality.department_id != department.departmentid:
            raise serializers.ValidationError({
                'municipality_id': 'El municipio no pertenece al departamento seleccionado.'
            })

        return attrs
