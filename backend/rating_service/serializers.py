from rest_framework import serializers
from .models import Rating

class RatingSerializer(serializers.ModelSerializer):
#Serializer para ratings de huéspedes
    guest_name = serializers.CharField(source='guest.get_full_name', read_only=True)

    class Meta:
        model = Rating
        fields = ['ratingid', 'listing', 'guest', 'guest_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['ratingid', 'created_at']