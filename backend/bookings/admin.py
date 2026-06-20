from django.contrib import admin
from .models import Booking, Ticket

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'booking_code',
        'session',
        'seat',
        'guest_name',
        'guest_email',
        'status',
        'reserved_at',
    )
    list_filter = ('status', 'session')
    search_fields = ('booking_code', 'guest_name', 'guest_email')

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'issued_at')
    search_fields = ('booking__booking_code',)

