from django.db import models

class Booking(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmada'),
        ('pending', 'Pendiente'),
        ('completed', 'Completada'),
        ('cancelled', 'Cancelada'),
    ]
    
    booking_id = models.AutoField(primary_key=True)
    listing = models.ForeignKey('listings_service.Listing', on_delete=models.CASCADE, related_name='bookings')
    guest = models.ForeignKey('users_service.CustomUser', on_delete=models.CASCADE, related_name='bookings')
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    number_of_guests = models.IntegerField()
    total_price = models.DecimalField(max_digits=15,decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'booking'
