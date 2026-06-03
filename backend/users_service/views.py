from .models import CustomUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import ContactHostSerializer, UserInformation, UserRegisterSerializer
from .serializers import CustomTokenObtainPairSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from django.http import Http404
from rest_framework.exceptions import ValidationError

class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "User created successfully.",
                    "user": {
                        "username": user.username,
                        "email": user.email,
                        "is_host": user.is_host,
                    }
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class ContactHostView(generics.RetrieveAPIView):
    queryset = CustomUser.objects.filter(is_host=True)
    serializer_class = ContactHostSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'host_id'

    def get_object(self):
        try:
            return super().get_object()
        except Http404:
            raise ValidationError(
                detail={
                    "detail": "El usuario no existe o no corresponde a un host."
                }
            )
        
class OwnProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserInformation
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user