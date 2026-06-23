from django.urls import path

from .views import PublicBookingCreateView

urlpatterns = [
    path('bookings', PublicBookingCreateView.as_view(), name='public-booking-create'),
]

