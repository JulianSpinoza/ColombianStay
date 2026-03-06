from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    # Información anidada del listado y huésped
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    listing_id = serializers.CharField(source='listing.accomodationid', read_only=True)
    listing_image = serializers.SerializerMethodField()
    listing_location = serializers.CharField(source='listing.locationdesc', read_only=True)
    
    guest_name = serializers.CharField(source='guest.get_full_name', read_only=True)
    guest_email = serializers.CharField(source='guest.email', read_only=True)
    guest_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'booking_id', 'listing', 'listing_title', 'listing_id', 'listing_image', 
            'listing_location', 'guest', 'guest_name', 'guest_email', 'guest_avatar',
            'check_in_date', 'check_out_date', 'number_of_guests', 'total_price', 
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['bookingid', 'created_at', 'updated_at']
    
    def get_listing_image(self, obj):
        # Placeholder: en producción, obtener imagen real del listado
        return "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"
    
    def get_guest_avatar(self, obj):
        # Placeholder: en producción, obtener avatar real del huésped
        return f"https://api.dicebear.com/7.x/avataaars/svg?seed={obj.guest.username}"