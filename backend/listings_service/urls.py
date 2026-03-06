from django.urls import path
from .views import ListingDetailView, ListingListView
from .views import PublishProperty

urlpatterns = [
    path('listings/', ListingListView.as_view(), name='listing-list'),
    path('publish-listing/', PublishProperty.as_view(), name='publish-property'),
    path('listings/<int:pk>/', ListingDetailView.as_view(), name='listing-detail'),
]