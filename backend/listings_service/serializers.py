from rest_framework import serializers
from .models import Listing, Rating

class ListingSerializer(serializers.ModelSerializer):

    # To use nested serializer cause the fk
    #user = UserSerializer()

    class Meta:
        model = Listing
        fields = '__all__'
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


class RatingSerializer(serializers.ModelSerializer):
#Serializer para ratings de huéspedes
    guest_name = serializers.CharField(source='guest.get_full_name', read_only=True)

    class Meta:
        model = Rating
        fields = ['ratingid', 'listing', 'guest', 'guest_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['ratingid', 'created_at']
