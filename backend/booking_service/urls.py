from django.urls import path

from .views import (
    BookingDatesView,
    GuestCancelReservationView,
    HostCancelReservationView,
    BookingTotalPriceView,
    UserReservationsView,
    CreateBookingView,
    HostReservationsView,
)

urlpatterns = [
    path(
        'reservations/<int:pk>/cancel/guest/',
        GuestCancelReservationView.as_view(),
        name='guest-cancel-reservation'
    ),
    path(
        'reservations/<int:pk>/cancel/host/',
        HostCancelReservationView.as_view(),
        name='host-cancel-reservation'
    ),
    path('user-reservations/', UserReservationsView.as_view(), name='user-reservations'),
    path('host-reservations/', HostReservationsView.as_view(), name='host-reservations'),
    path('bookings/', CreateBookingView.as_view(), name='create-booking'),
    path('bookings/total_price/', BookingTotalPriceView.as_view(), name='obtain-total-price'),
    path('bookings/<int:listing_id>/', BookingDatesView.as_view(), name='obtain_reserved_dates'),
]