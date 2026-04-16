from django.db import models
from django.core.validators import MinValueValidator, MinLengthValidator
from django.db.models import Q

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
    class PropertyType(models.TextChoices):
        APARTMENT = 'apartment', 'Apartment'
        CABIN = 'cabin', 'Cabin'
        HOUSE = 'house', 'House'
        LOFT = 'loft', 'Loft'
        ROOM = 'room', 'Room'
        STUDIO = 'studio', 'Studio'

    accomodationid = models.AutoField(primary_key=True)
    owner = models.ForeignKey('users_service.CustomUser', on_delete=models.CASCADE)
    municipality = models.ForeignKey(Municipality, on_delete=models.CASCADE)

    title = models.CharField(
        max_length=50,
        validators=[MinLengthValidator(5)]
    )
    description = models.TextField(
        validators=[MinLengthValidator(20)]
    )
    bedrooms = models.IntegerField(
        validators=[MinValueValidator(1)]
    )
    bathrooms = models.IntegerField(
        validators=[MinValueValidator(1)]
    )
    locationdesc = models.TextField(
        validators=[MinLengthValidator(10)]
    )
    addresstext = models.CharField(
        max_length=50,
        validators=[MinLengthValidator(5)]
    )
    propertytype = models.CharField(
        max_length=20,
        choices=PropertyType.choices
    )
    pricepernight = models.IntegerField(
        validators=[MinValueValidator(0)]
    )
    maxguests = models.IntegerField(
        validators=[MinValueValidator(1)]
    )

    class Meta:
        db_table = 'accomodation'
        constraints = [
            models.CheckConstraint(
                condition=Q(bedrooms__gte=1),
                name='listing_bedrooms_gte_1'
            ),
            models.CheckConstraint(
                condition=Q(bathrooms__gte=1),
                name='listing_bathrooms_gte_1'
            ),
            models.CheckConstraint(
                condition=Q(maxguests__gte=1),
                name='listing_maxguests_gte_1'
            ),
            models.CheckConstraint(
                condition=Q(pricepernight__gte=0),
                name='listing_pricepernight_gte_0'
            ),
            models.UniqueConstraint(
                fields=['owner', 'municipality', 'title', 'addresstext'],
                name='listing_unique_owner_municipality_title_address'
            ),
        ]