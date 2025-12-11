from django.db import models

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

class Rating(models.Model):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]
    
    ratingid = models.AutoField(primary_key=True)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='ratings')
    guest = models.ForeignKey('users_service.CustomUser', on_delete=models.CASCADE, related_name='guest_ratings')
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rating'
        unique_together = ('listing', 'guest')
