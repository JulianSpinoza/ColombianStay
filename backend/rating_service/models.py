from django.db import models

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
