from django.urls import path
from .views import HostRatingsView

urlpatterns = [
    path('host-ratings/', HostRatingsView.as_view(), name='host-ratings'),
]