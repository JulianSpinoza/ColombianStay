from django.db import models

class Rating(models.Model):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)] # 1 - 5
    
    ratingid = models.AutoField(primary_key=True)
    listing = models.ForeignKey('listings_service.Listing', on_delete=models.CASCADE, related_name='ratings')
    guest = models.ForeignKey('users_service.CustomUser', on_delete=models.CASCADE, related_name='guest_ratings')
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rating'
        unique_together = ('listing', 'guest')

