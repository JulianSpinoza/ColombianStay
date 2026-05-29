from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q

from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator

from phonenumber_field.modelfields import PhoneNumberField

class CustomUser(AbstractUser):

    def upload_path(instance, filename):
        return f'users/{instance.username}/{filename}'
    
    def validate_image_size(archive):
        # Definir el límite en Megabytes (ejemplo: 2MB)
        limit_mb = 2
        limit_bytes = limit_mb * 1024 * 1024
        
        if archive.size > limit_bytes:
            raise ValidationError(f"El tamaño máximo permitido es de {limit_mb}MB.")

    phone_number = PhoneNumberField(region="CO")
    is_host = models.BooleanField(default=False, help_text='Designates whether this user has properties.', verbose_name='host status')
    email_as_contact = models.BooleanField(default=False, help_text='Establish the email to share')
    profile_picture = models.ImageField(
        upload_to=upload_path,
        validators=[
            FileExtensionValidator(['jpg', 'png', 'jpeg']),
            validate_image_size
        ]
    )

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


