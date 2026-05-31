from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from PIL import Image

from users_service.models import CustomUser

import io

def generate_test_image(image_format="JPEG"):
    file = io.BytesIO()
    image = Image.new("RGB", (100, 100))
    image.save(file, image_format)
    file.seek(0)
    return file

def make_uploaded_image(name="test_image.jpg", content_type="image/jpeg"):
    return SimpleUploadedFile(
        name=name,
        content=generate_test_image().read(),
        content_type=content_type,
    )

class BaseUserTestMixin:
    def create_user(self, **overrides):
        data = {
            'username': "UserTest",
            'password': "user%Test@Pas$W0rd",
            'first_name': "Pepito", 
            'last_name': "Perez", 
            'email': "pepitoperez@correo.com", 
            'phone_number': "3121234567", 
            'profile_picture':make_uploaded_image("test_profile_image.jpg","image/jpg"),
        }
        data.update(overrides)
        return CustomUser.objects.create(**data)
    
    def get_valid_payload(self):
        return {
            'username': "UserTest",
            'password': "user%Test@Pas$W0rd",
            'first_name': "Pepito", 
            'last_name': "Perez", 
            'email': "pepitoperez@correo.com", 
            'phone_number': "3121234567", 
            'profile_picture':make_uploaded_image("test_profile_image.jpg","image/jpg"),
        }
    
    def get_valid_payload_with_image(self):
        payload = self.get_valid_payload()
        payload["profile_picture"] = make_uploaded_image("test_profile_image.jpg","image/jpg"),
        return payload

class RegisterUserAPITests(BaseUserTestMixin, APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.url = reverse('register')

    def test_register_user_successfully(self):

        payload = self.get_valid_payload()

        response = self.client.post(
            self.url,
            payload,
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user_created = CustomUser.objects.get(username=payload.get("username"))
        
        self.assertEqual(user_created.first_name, payload.get("first_name"))
        self.assertEqual(user_created.last_name, payload.get("last_name"))
        self.assertEqual(user_created.email, payload.get("email"))
        self.assertEqual(user_created.phone_number, f"+57{payload.get('phone_number')}")
        self.assertFalse(user_created.email_as_contact)

        # Verify that the password is hashed (or at least not raw)
        self.assertNotEqual(user_created.password, payload.get("password"))

        self.assertTrue(user_created.check_password(payload.get("password")))
        self.assertFalse(user_created.check_password("ContraseñaIncorrecta999"))
    
    def test_register_user_with_image_successfully(self):

        payload = self.get_valid_payload_with_image()

        response = self.client.post(
            self.url,
            payload,
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user_created = CustomUser.objects.get(username=payload.get("username"))
        
        self.assertEqual(user_created.first_name, payload.get("first_name"))
        self.assertEqual(user_created.last_name, payload.get("last_name"))
        self.assertEqual(user_created.email, payload.get("email"))
        self.assertEqual(user_created.phone_number, f"+57{payload.get('phone_number')}")
        self.assertFalse(user_created.email_as_contact)
        self.assertTrue(user_created.profile_picture)

        # Verify that the password is hashed (or at least not raw)
        self.assertNotEqual(user_created.password, payload.get("password"))

        self.assertTrue(user_created.check_password(payload.get("password")))
        self.assertFalse(user_created.check_password("ContraseñaIncorrecta999"))

class LoginUserAPITests:
    pass

class ContactHostInfoAPITests:
    pass

class OwnProfileAPITests(BaseUserTestMixin, APITestCase):

    def setUp(self):
        self.user = self.create_user()
        self.url = reverse('my_profile')

    def test_requires_authentication_to_access_own_info(self):
        response = self.client.get(
            self.url
        )

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

    def test_requires_authentication_to_update_own_info(self):

        original_payload = self.get_valid_payload()
        changed_payload = {"email": "correoactualizado@correo.com"}

        response = self.client.patch(
            self.url,
            changed_payload,
            format="json",
        )

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

        self.user.refresh_from_db()
        self.assertEqual(self.user.email, original_payload.get("email"))

    def test_get_my_user_info_successfully(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(
            self.url
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_my_user_info_successfully(self):
        self.client.force_authenticate(user=self.user)

        changed_payload = {"email": "correoactualizado@correo.com"}

        response = self.client.patch(
            self.url,
            changed_payload,
            format="json",
        )

        self.user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.email, changed_payload.get("email"))

    #def test_cannot_update_user_information_from_another_user