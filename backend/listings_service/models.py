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
    user = models.ForeignKey('users_service.CustomUser', on_delete=models.CASCADE)
    municipality = models.ForeignKey(Municipality, on_delete=models.CASCADE )
    title = models.CharField(max_length=50)
    pricepernight = models.IntegerField()
    maxguests = models.IntegerField()

    class Meta:
        db_table = 'accomodation'