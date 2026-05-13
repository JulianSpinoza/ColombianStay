from rest_framework import serializers
from .models import Rating

class RatingSerializer(serializers.ModelSerializer):
    
    guest_name = serializers.CharField(
        source='booking.guest.get_full_name',
        read_only=True
    )
    guest = serializers.IntegerField(
        source='booking.guest.id',
        read_only=True
    )

    class Meta:
        model = Rating
        fields = ['ratingid', 'booking', 'guest', 'guest_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['ratingid', 'created_at']