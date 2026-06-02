from django.urls import path

from booking_service.views import PendingRatingsListView
from .views import CreateRatingView, HostRatingsView

urlpatterns = [
    path('host-ratings/', HostRatingsView.as_view(), name='host-ratings'),
    path('ratings/pending/', PendingRatingsListView.as_view(), name='pending-ratings'),
    path('rating/booking/<int:booking_id>/', CreateRatingView.as_view(), name='create-rating'),
]