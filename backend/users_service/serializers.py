from rest_framework import serializers
from .models import CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'is_host']
        extra_kwargs = {
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