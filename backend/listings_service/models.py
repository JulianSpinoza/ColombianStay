from django.db import models

class Listing(models.Model):

    # To use nested serializer cause the fk
    #user = models.ForeignKey(User, on_delete=models.CASCADE)
    accomodationid = models.AutoField(primary_key=True)
    userid = models.IntegerField()
    idregion = models.IntegerField()
    iddepartment = models.IntegerField()
    idmunicipality = models.IntegerField()
    title = models.CharField(max_length=50)
    pricepernight = models.IntegerField()
    maxguests = models.IntegerField()

    class Meta:
        db_table = 'accomodation'
        managed = False # Do not change the model of what i have on my db

class Municipality(models.Model):

    # To later
    #idregion = models.ForeignKey(Region, on_delete=models.DO_NOTHING, db_column='idregion')
    #iddepartment = models.ForeignKey(Department, on_delete=models.DO_NOTHING, db_column='iddepartment')

    idregion = models.IntegerField()
    iddepartment = models.IntegerField()
    idmunicipality = models.AutoField(primary_key= True)
    name = models.CharField(max_length=40, db_column= 'namemunicipal')

    class Meta:
        db_table = 'municipality'
        managed = False # Do not change the model of what i have on my db
        unique_together = ('idregion', 'iddepartment', 'idmunicipality')