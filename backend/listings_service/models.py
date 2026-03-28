from django.db import models
from django.core.validators import FileExtensionValidator
from django.db.models import Q

from .utils import create_thumbnail
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

class ListingImage(models.Model):

    def upload_path(instance, filename):
        return f'listings/accomodation_{instance.listing.accomodationid}/{filename}'

    def save(self, *args, **kwargs):
        if not self.pk:
            super().save(*args, **kwargs)

        if self.image and not self.thumbnail:
            self.thumbnail = create_thumbnail(self.image)
            super().save(update_fields=['thumbnail'])

    id = models.AutoField(primary_key=True)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(
        upload_to=upload_path,
        validators=[FileExtensionValidator(['jpg', 'png', 'jpeg'])]
    )
    thumbnail = models.ImageField(
        upload_to=upload_path,
        validators=[FileExtensionValidator(['jpg', 'png', 'jpeg'])],
        null=True, 
        blank=True)
    is_main = models.BooleanField(default=False)

    class Meta:
        db_table = 'image_accomodation'
        constraints = [
            models.UniqueConstraint(
                fields=['listing'],
                condition=Q(is_main=True),
                name='unique_main_image_per_listing'
            )
        ]