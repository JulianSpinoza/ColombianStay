from django.urls import path
from .views import ListingListView, HostRatingsView

urlpatterns = [
    path('listings/', ListingListView.as_view(), name='listing-list'),
    path('host-ratings/', HostRatingsView.as_view(), name='host-ratings'),
]