from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.db.models import Q, F


class Booking(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmada'),
        ('pending', 'Pendiente'),
        ('completed', 'Completada'),
        ('cancelled', 'Cancelada'),
    ]

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
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
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
            models.Index(fields=['guest', 'status']),
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