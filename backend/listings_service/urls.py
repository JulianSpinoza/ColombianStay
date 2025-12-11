from django.urls import path
from .views import ListingListView
from .views import PublishProperty
from .views import HostRatingsView

urlpatterns = [
    path('listings/', ListingListView.as_view(), name='listing-list'),
    path('publish-listing/', PublishProperty.as_view(), name='publish-property'),
    path('host-ratings/', HostRatingsView.as_view(), name='host-ratings'),
