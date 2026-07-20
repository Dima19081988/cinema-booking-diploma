from django.urls import path

from .views import (
    PublicBookingCreateView, 
    PublicBookingDetailView, 
    PublicBookingQrView,
    PublicBookingByCodeView,
    PublicBookingTicketView,
    AdminBookingListView,
    AdminBookingStatusUpdateView
)
urlpatterns = [
## public ##
    path('bookings/', PublicBookingCreateView.as_view(), name='public-booking-create'),
    path('bookings/<int:booking_id>/', PublicBookingDetailView.as_view(), name='public-booking-detail'),
    path('bookings/<int:booking_id>/qr/', PublicBookingQrView.as_view(), name='public-booking-qr'),
    path('bookings/<int:booking_id>/ticket/', PublicBookingTicketView.as_view()),
    path('bookings/code/<str:booking_code>/', PublicBookingByCodeView.as_view(), name='public-booking-by-code'),
## admin ##
    path('admin/bookings/', AdminBookingListView.as_view(), name='admin-booking-list'),
    path('admin/bookings/<int:booking_id>/status/', AdminBookingStatusUpdateView.as_view(), name='admin-booking-status-update'),
]

