from django.urls import path
from .views import ListingDetailView, ListingListView, RegionListView, DepartmentListView, MunicipalityListView
from .views import PublishProperty

urlpatterns = [
    path('listings/', ListingListView.as_view(), name='listing-list'),
    path('publish-listing/', PublishProperty.as_view(), name='publish-property'),
    path('listings/<int:pk>/', ListingDetailView.as_view(), name='listing-detail'),
    path('listings/region/', RegionListView.as_view(), name='region-list'),
    path('listings/region/<int:region_id>/', DepartmentListView.as_view(), name='department-list'),
    path('listings/department/<int:department_id>/', MunicipalityListView.as_view(), name='municipality-list'),
]