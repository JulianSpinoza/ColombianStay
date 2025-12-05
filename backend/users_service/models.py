from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    is_host = models.BooleanField(default=False)

    def __str__(self):
        return self.username
    
    class Meta:
        db_table = "app_users"


