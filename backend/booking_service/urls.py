from django.urls import path
from .views import CancelReservationView
from .views import UserReservationsView
from .views import CreateBookingView
from .views import HostReservationsView

urlpatterns = [
    path('reservations/<int:pk>/cancel/', CancelReservationView.as_view(), name='cancel-reservation'),
    path('user-reservations/', UserReservationsView.as_view(), name='user-reservations'),
    path('host-reservations/', HostReservationsView.as_view(), name='host-reservations'),
    path('bookings/', CreateBookingView.as_view(), name='create-booking'),
]