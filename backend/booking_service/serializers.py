from rest_framework import serializers

from django.utils import timezone
from django.db.models import Q

from decimal import Decimal

from .models import Booking, BookingStatus, calculate_total_price
from listings_service.models import Listing

class BookingSerializer(serializers.ModelSerializer):
    listing_title = serializers.CharField(
        source='listing.title',
        read_only=True
    )
    listing_image = serializers.SerializerMethodField()
    listing_location = serializers.CharField(
        source='listing.locationdesc',
        read_only=True
    )

    guest_name = serializers.CharField(
        source='guest.get_full_name',
        read_only=True
    )
    guest_email = serializers.CharField(
        source='guest.email',
        read_only=True
    )
    guest_avatar = serializers.SerializerMethodField()

    # status = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'booking_id',
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
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'booking_id',
            'created_at',
            'updated_at',
            'listing_title',
            'listing_image',
            'listing_location',
            'guest_name',
            'guest_email',
            'guest_avatar',
            'total_price',
            'actual_status',
        ]

    def get_status(self, obj):
        if not obj.actual_status:
            return ""

        return obj.actual_status.lower()

    def get_guest_name(self, obj):
        full_name = obj.guest.get_full_name()

        if full_name:
            return full_name

        return obj.guest.username

    def get_listing_image(self, obj):
        request = self.context.get("request")

        listing_image = (
            obj.listing.images
            .filter(is_main=True)
            .first()
        )

        if listing_image is None:
            listing_image = obj.listing.images.first()

        if listing_image and listing_image.image:
            image_url = listing_image.image.url

            if request:
                return request.build_absolute_uri(image_url)

            return image_url

        return None

    def get_guest_avatar(self, obj):
        return (
            f"https://api.dicebear.com/7.x/avataaars/svg?"
            f"seed={obj.guest.username}"
        )

class CreateBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            "check_in_date",
            "check_out_date",
            "number_of_guests",
        ]

    def validate_check_in_date(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError(
                "La fecha de entrada no puede estar en el pasado."
            )

        return value

    def validate_number_of_guests(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Debe haber al menos 1 huésped."
            )

        return value

    def validate(self, attrs):
        check_in = attrs.get("check_in_date")
        check_out = attrs.get("check_out_date")
        guests = attrs.get("number_of_guests")

        listing = self.context.get("listing")
        request = self.context.get("request")

        errors = {}

        if not check_in:
            errors["check_in_date"] = "Este campo es obligatorio."

        if not check_out:
            errors["check_out_date"] = "Este campo es obligatorio."

        if check_in and check_out and check_out <= check_in:
            errors['check_out_date'] = (
                'La fecha de salida debe ser posterior a la fecha de entrada.'
            )

        if guests is not None and guests < 1:
            errors["number_of_guests"] = "Debe haber al menos 1 huésped."

        if listing is None:
            errors["listing"] = "No fue posible identificar la propiedad."

        max_guests = getattr(listing, "maxguests", None) if listing else None

        max_guests = getattr(listing, 'maxguests', None) if listing else None

        if (
            max_guests is not None
            and guests is not None
            and guests > max_guests
        ):
            errors['number_of_guests'] = (
                f'La propiedad permite máximo {max_guests} huéspedes.'
            )

        owner = getattr(listing, 'owner', None) if listing else None

        if (
            request
            and request.user
            and request.user.is_authenticated
            and owner
            and owner == request.user
        ):
            errors['listing'] = 'No puedes reservar tu propia propiedad.'

        if listing and check_in and check_out:
            overlap_exists = Booking.objects.filter(
                listing=listing,
                actual_status__in=[
                    BookingStatus.PENDING,
                    BookingStatus.CONFIRMED,
                    BookingStatus.ACTIVE,
                ],
                check_in_date__lt=check_out,
                check_out_date__gt=check_in,
            ).exists()

            if overlap_exists:
                errors["non_field_errors"] = [
                    "La propiedad ya tiene una reserva en ese rango de fechas."
                ]

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        listing = self.context["listing"]

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
                "La fecha de entrada no puede estar en el pasado."
            )

        return value

    def validate_guests(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Debe haber al menos 1 huésped."
            )

        return value

    def validate(self, attrs):
        check_in = attrs.get("check_in_date")
        check_out = attrs.get("check_out_date")
        guests = attrs.get("guests")

        listing = self.context.get("listing")

        errors = {}

        if not check_in:
            errors["check_in_date"] = "Este campo es obligatorio."

        if not check_out:
            errors["check_out_date"] = "Este campo es obligatorio."

        if check_in and check_out and check_out <= check_in:
            errors['check_out_date'] = (
                'La fecha de salida debe ser posterior a la fecha de entrada.'
            )

        if guests is not None and guests < 1:
            errors["guests"] = "Debe haber al menos 1 huésped."

        if listing is None:
            errors['listing'] = 'No fue posible identificar la propiedad.'

        max_guests = getattr(listing, 'maxguests', None) if listing else None

        if (
            max_guests is not None
            and guests is not None
            and guests > max_guests
        ):
            errors['guests'] = (
                f'La propiedad permite máximo {max_guests} huéspedes.'
            )

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    def calculate_total(self):
        listing = self.context['listing']
        check_in = self.validated_data['check_in_date']
        check_out = self.validated_data['check_out_date']

        num_nights = (check_out - check_in).days

        total_price = calculate_total_price(
            listing.pricepernight,
            num_nights
        )

        return total_price


class CancelBookingSerializer(serializers.Serializer):
    reason = serializers.CharField(
        required=True,
        allow_blank=False,
        trim_whitespace=True,
        error_messages={
            'required': 'El motivo de cancelación es obligatorio.',
            'blank': 'El motivo de cancelación no puede estar vacío.',
        }
    )

    def validate_reason(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'El motivo de cancelación no puede estar vacío.'
            )

        return value
