from rest_framework import serializers
from .models import Listing

class ListingSerializer(serializers.ModelSerializer):

    # To use nested serializer cause the fk
    #user = UserSerializer()

    class Meta:
        model = Listing
        fields = '__all__'
        read_only_fields = ['accomodationid']
        extra_kwargs = {
            'pricepernight': {'min_value': 0},
        }