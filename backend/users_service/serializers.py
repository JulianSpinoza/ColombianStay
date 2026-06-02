from rest_framework import serializers
from .models import CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from phonenumber_field.serializerfields import PhoneNumberField
class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    phone_number = PhoneNumberField(region="CO")
    class Meta:
        model = CustomUser
        fields = [
            'username', 
            'email', 
            'password', 
            'first_name', 
            'last_name', 
            'is_host',
            'phone_number',
            'profile_picture',
            ]
        extra_kwargs = {
            'username' : {'required': True},
            'password' : {'required': True},
            'email': {'required': True},
            'is_host': {'required': False},
        }

    def create(self, validated_data):
        # Remove the password to hashed
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)  # hash password
        user.save()
        return user
    def update_host_status(self, is_host, user):
        user.is_host = is_host
        user.save()
        return user
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Información adicional en el token
        token['is_host'] = user.is_host
        token['username'] = user.username

        return token

class ContactHostSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name','email','email_as_contact']
        read_only_fields = ['first_name','email', 'email_as_contact']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not instance.email_as_contact:
            data["email"] = None

        return data
    

class UserInformation(serializers.ModelSerializer):

    phone_number = PhoneNumberField(region="CO")
    class Meta:
        model=CustomUser
        fields=[
            'username',
            'first_name', 
            'last_name', 
            'email', 
            'phone_number', 
            'profile_picture'
            ]
    
    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.phone_number:
            data["phone_number"] = instance.phone_number.national_number
        
        return data