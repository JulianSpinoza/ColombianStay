from django.urls import path
from .views import ContactHostView, RegisterView, CustomLoginView, OwnProfileView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomLoginView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('contact_host/<int:host_id>/',ContactHostView.as_view(), name=''),
    path('profile/me/', OwnProfileView.as_view(), name='my_profile')
]
