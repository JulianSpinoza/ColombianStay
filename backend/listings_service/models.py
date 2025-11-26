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