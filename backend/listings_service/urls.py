from django.urls import path
from .views import ListingListView, hostListingsView
from .views import PublishProperty
from .views import HostRatingsView

urlpatterns = [
    path('listings/', ListingListView.as_view(), name='listing-list'),
    path('publish-listing/', PublishProperty.as_view(), name='publish-property'),
    path('host-ratings/', HostRatingsView.as_view(), name='host-ratings'),
    path('hostreservations/', hostListingsView.as_view(), name='host-listings'),
]