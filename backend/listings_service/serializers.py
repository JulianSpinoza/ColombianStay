from rest_framework import serializers
from .models import Listing, ListingImage

class ListingImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = ListingImage
        fields = ['id', 'image_url', 'thumbnail_url', 'is_main']

    def get_image_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image.url)

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None

class ListingSerializer(serializers.ModelSerializer):

    images = ListingImageSerializer(many=True, read_only=True)
    class Meta:
        model = Listing
        fields = [
            'accomodationid',
            'owner', # Maybe add an UserSerializer type in this matter
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
            'images'
        ]
        read_only_fields = ['accomodationid']

class PublishListingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Listing
        exclude = ['owner','municipality']
        read_only_fields = ['accomodationid']
        extra_kwargs = {
            'pricepernight': {'min_value': 0},
            'bedrooms': {'min_value': 1},
            'bathrooms': {'min_value': 1},
        }