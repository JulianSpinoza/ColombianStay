from django.db import models
from django.utils import timezone

class Region(models.Model):
  
    regionid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=40, db_column= 'nameregion')

    class Meta:
        db_table = 'region'

class Department(models.Model):

    departmentid = models.AutoField(primary_key=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    name = models.CharField(max_length=40, db_column= 'namedeparment')

    class Meta:
        db_table = 'department'

class Municipality(models.Model):

    municipalityid = models.AutoField(primary_key=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    name = models.CharField(max_length=40, db_column= 'namemunicipal')

    class Meta:
        db_table = 'municipality'

class Listing(models.Model):

    accomodationid = models.AutoField(primary_key=True)
    owner = models.ForeignKey('users_service.CustomUser', on_delete=models.CASCADE)
    municipality = models.ForeignKey(Municipality, on_delete=models.CASCADE )
    title = models.CharField(max_length=50)
    description = models.TextField()
    bedrooms = models.IntegerField()
    bathrooms = models.IntegerField()
    locationdesc = models.TextField()
    addresstext = models.CharField(max_length=50)
    propertytype = models.CharField(max_length=20)
    pricepernight = models.IntegerField()
    maxguests = models.IntegerField()

    class Meta:
        db_table = 'accomodation'

    def get_unavailable_dates(self):

        from booking_service.models import Booking, BookingStatus

        today = timezone.localdate()

        bookings = Booking.objects.filter(
            listing=self,
            check_out_date__gt=today,
        ).exclude(
            actual_status__in=[BookingStatus.CANCELLED]
        ).order_by('check_in_date')

        return [
            {"start": booking.check_in_date, "end": booking.check_out_date} 
            for booking in bookings
        ]