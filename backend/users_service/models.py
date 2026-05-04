from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q

class CustomUser(AbstractUser):
    is_host = models.BooleanField(default=False, help_text='Designates whether this user has properties.', verbose_name='host status')
    email_as_contact = models.BooleanField(default=False, help_text='Establish the email to share')

    def __str__(self):
        return self.username
    
    class Meta:
        db_table = "app_users"
        constraints = [
            models.CheckConstraint(
                condition=Q(email_as_contact=False) | Q(is_host=True),
                name='email_contact_available_only_if_is_host'
            )
        ]


