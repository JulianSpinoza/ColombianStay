from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.db.models import Q, F

from django.db import transaction

from listings_service.models import Listing

def calculate_total_price(price_per_night, nights):
    return price_per_night * nights

class Actuator(models.TextChoices):
    GUEST = "GUEST", "Huésped"
    HOST = "HOST", "Anfitrión"

class BookingStatus(models.TextChoices):
    PENDING = "PENDING", "Pendiente"
    CONFIRMED = "CONFIRMED", "Confirmada"
    ACTIVE = "ACTIVE", "Activa"
    CANCELLED = "CANCELLED", "Cancelada"
    COMPLETED = "COMPLETED", "Completada"

class Booking(models.Model):

    booking_id = models.AutoField(primary_key=True)
    listing = models.ForeignKey(
        'listings_service.Listing',
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    guest = models.ForeignKey(
        'users_service.CustomUser',
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    number_of_guests = models.IntegerField(validators=[MinValueValidator(1)])
    total_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    actual_status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'booking'
        constraints = [
            models.CheckConstraint(
                condition=Q(check_out_date__gt=F('check_in_date')),
                name='booking_check_out_after_check_in'
            ),
            models.CheckConstraint(
                condition=Q(number_of_guests__gte=1),
                name='booking_guests_gte_1'
            ),
            models.CheckConstraint(
                condition=Q(total_price__gte=0),
                name='booking_total_price_gte_0'
            ),
        ]
        indexes = [
            models.Index(fields=['listing', 'check_in_date', 'check_out_date']),
            models.Index(fields=['guest', 'actual_status']),
        ]

    def clean(self):
        errors = {}

        if self.check_in_date and self.check_out_date:
            if self.check_out_date <= self.check_in_date:
                errors['check_out_date'] = 'La fecha de salida debe ser posterior a la fecha de entrada.'

        if self.number_of_guests is not None and self.number_of_guests < 1:
            errors['number_of_guests'] = 'Debe haber al menos 1 huésped.'

        if self.total_price is not None and self.total_price < 0:
            errors['total_price'] = 'El precio total no puede ser negativo.'

        if errors:
            raise ValidationError(errors)
        
    def update_status(self, new_status, desc_of_transaction=None, principal_actuator=None):

        with transaction.atomic():
            self.actual_status = new_status
            self.save()

            if new_status == BookingStatus.CANCELLED:
                BookingStatusHistory.objects.create(
                    booking=self,
                    status=new_status,
                    principal_actuator=principal_actuator,
                    desc_of_transaction=desc_of_transaction
                )
            else:    
                BookingStatusHistory.objects.create(
                    booking=self,
                    status=new_status
                )

    def save(self, *args, **kwargs):
        is_new = self._state.adding 

        if self.check_in_date and self.check_out_date and self.listing_id:
            nights = (self.check_out_date - self.check_in_date).days

            if nights > 0:
                if hasattr(self, '_listing_cache'):
                    price_per_night = self.listing.pricepernight
                else:
                    price_per_night = Listing.objects.only('pricepernight').get(
                        pk=self.listing_id
                    ).pricepernight

                self.total_price = calculate_total_price(price_per_night, nights)

        with transaction.atomic():
            super().save(*args, **kwargs)

            if is_new:
                BookingStatusHistory.objects.create(
                    booking=self,
                    status=self.actual_status
                )
        
class BookingStatusHistory(models.Model):

    booking_status_history_id = models.AutoField(primary_key=True)
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='booking'
    )
    status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING
    )
    desc_of_transaction = models.TextField(null=True, blank=True)
    principal_actuator = models.CharField(
        max_length=20,
        choices=Actuator.choices,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'booking_status_history'
        constraints = [
            models.UniqueConstraint(
                fields=['booking', 'status'],
                name='unique_booking_status'
            ),
            models.CheckConstraint(
                condition=(
                    ~Q(status=BookingStatus.CANCELLED)
                    | 
                    Q(desc_of_transaction__isnull=False, 
                      principal_actuator__isnull=False
                    ) 
                ),
                name='cancelled_requires_fields',
            )
        ]