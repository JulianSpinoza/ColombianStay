from rest_framework import serializers
from .models import Booking, BookingStatus, calculate_total_price
from listings_service.models import Listing
from django.utils import timezone

from django.db.models import Q

from decimal import Decimal

class BookingSerializer(serializers.ModelSerializer):
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    listing_image = serializers.SerializerMethodField()
    listing_location = serializers.CharField(source='listing.locationdesc', read_only=True)

    guest_name = serializers.CharField(source='guest.get_full_name', read_only=True)
    guest_email = serializers.CharField(source='guest.email', read_only=True)
    guest_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'listing_title',
            'listing_image',
            'listing_location',
            'guest_name',
            'guest_email',
            'guest_avatar',
            'check_in_date',
            'check_out_date',
            'number_of_guests',
            'total_price',
            'actual_status',
        ]
        read_only_fields = [
            'created_at',
            'updated_at',
            'listing_title',
            'listing_id',
            'listing_image',
            'listing_location',
            'guest_name',
            'guest_email',
            'guest_avatar',
        ]

    def get_listing_image(self, obj):
        return "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"

    def get_guest_avatar(self, obj):
        return f"https://api.dicebear.com/7.x/avataaars/svg?seed={obj.guest.username}"
    
class CreateBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'check_in_date',
            'check_out_date',
            'number_of_guests',
        ]

    def validate_check_in_date(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError(
                'La fecha de entrada no puede estar en el pasado.'
            )
        return value

    def validate_number_of_guests(self, value):
        if value < 1:
            raise serializers.ValidationError(
                'Debe haber al menos 1 huésped.'
            )
        return value

    def validate(self, attrs):
        check_in = attrs.get('check_in_date')
        check_out = attrs.get('check_out_date')
        guests = attrs.get('number_of_guests')

        listing = self.context.get('listing')
        request = self.context.get('request')

        errors = {}

        if not check_in:
            errors['check_in_date'] = 'Este campo es obligatorio.'

        if not check_out:
            errors['check_out_date'] = 'Este campo es obligatorio.'

        if check_in and check_out and check_out <= check_in:
            errors['check_out_date'] = 'La fecha de salida debe ser posterior a la fecha de entrada.'

        if guests is not None and guests < 1:
            errors['number_of_guests'] = 'Debe haber al menos 1 huésped.'

        if listing is None:
            errors['listing'] = 'No fue posible identificar la propiedad.'

        # Listing tiene capacidad máxima de huespedes
        max_guests = getattr(listing, 'maxguests', None) if listing else None
        if max_guests is not None and guests is not None and guests > max_guests:
            errors['number_of_guests'] = f'La propiedad permite máximo {max_guests} huéspedes.'

        # Evitar que el usuario reserve su propia propiedad, si existe owner
        owner = getattr(listing, 'owner', None) if listing else None
        if request and request.user and owner and owner == request.user:
            errors['listing'] = 'No puedes reservar tu propia propiedad.'

        # Solapamiento de reservas
        # Dos rangos se solapan si:
        # nueva_entrada < reserva_existente.salida
        # y nueva_salida > reserva_existente.entrada
        if listing and check_in and check_out:
            overlap_exists = Booking.objects.filter(
                listing=listing,
                actual_status__in=[
                    BookingStatus.PENDING,
                    BookingStatus.CONFIRMED, 
                    BookingStatus.ACTIVE,
                    BookingStatus.CONFIRMED
                ],
                check_in_date__lt=check_out,
                check_out_date__gt=check_in,
            ).exists()

            if overlap_exists:
                errors['non_field_errors'] = [
                    'La propiedad ya tiene una reserva en ese rango de fechas.'
                ]

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    def create(self, validated_data):
        request = self.context['request']
        listing = self.context['listing']

        return Booking.objects.create(
            listing=listing,
            guest=request.user,
            actual_status=BookingStatus.PENDING,
            **validated_data
        )
    
class BookingTotalPriceSerializer(serializers.Serializer):

    check_in_date = serializers.DateField()
    check_out_date = serializers.DateField()
    guests = serializers.IntegerField(required=False)

    def validate_check_in_date(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError(
                'La fecha de entrada no puede estar en el pasado.'
            )
        return value

    def validate_guests(self, value):
        if value < 1:
            raise serializers.ValidationError(
                'Debe haber al menos 1 huésped.'
            )
        return value
    
    def validate(self, attrs):
        check_in = attrs.get('check_in_date')
        check_out = attrs.get('check_out_date')
        guests = attrs.get('guests')

        listing = self.context.get('listing')

        errors = {}

        if not check_in:
            errors['check_in_date'] = 'Este campo es obligatorio.'

        if not check_out:
            errors['check_out_date'] = 'Este campo es obligatorio.'

        if check_in and check_out and check_out <= check_in:
            errors['check_out_date'] = 'La fecha de salida debe ser posterior a la fecha de entrada.'

        if guests is not None and guests < 1:
            errors['guests'] = 'Debe haber al menos 1 huésped.'

        if listing is None:
            errors['listing'] = 'No fue posible identificar la propiedad.'
        
        max_guests = getattr(listing, 'maxguests', None) if listing else None
        if max_guests is not None and guests is not None and guests > max_guests:
            errors['guests'] = f'La propiedad permite máximo {max_guests} huéspedes.'
    
        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    def calculate_total(self):

        listing = self.context['listing']
        check_in = self.validated_data['check_in_date']
        check_out = self.validated_data['check_out_date']
        
        num_nights = (check_out - check_in).days
        
        total_price = calculate_total_price(listing.pricepernight,num_nights)
        
        return total_price
    
class PendingRatingBookingSerializer(serializers.ModelSerializer):
    listing_title = serializers.CharField(
        source='listing.title',
        read_only=True
    )

    class Meta:
        model = Booking
        fields = [
            'booking_id',
            'listing',
            'listing_title',
            'check_in_date',
            'check_out_date',
            'total_price',
            ]