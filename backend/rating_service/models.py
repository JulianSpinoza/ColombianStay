from django.db import models
from django.core.exceptions import ValidationError

from booking_service.models import BookingStatus

class Rating(models.Model):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)] # 1 - 5
    
    ratingid = models.AutoField(primary_key=True)
    booking = models.OneToOneField('booking_service.Booking', on_delete=models.CASCADE, related_name='review')
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rating'

    def clean(self):
        super().clean()

        if self.booking.actual_state != BookingStatus.COMPLETED:
            raise ValidationError(
                {"booking": "Solo se pueden calificar reservas completadas."}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    
