from django.contrib import admin
from .models import Hall, Seat, Session

@admin.register(Hall)
class HallAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'rows_count', 'seats_per_row', 'is_active')
    search_fields = ('name',)

    def save_model(self, request, obj, form, change):
        is_new = obj.pk is None
        super().save_model(request, obj, form, change)

        if is_new:
            seats = []
            for row in range(1, obj.rows_count + 1):
                for seat in range(1, obj.seats_per_row + 1):
                    seat_type = Seat.SeatType.STANDARD
                    seat = Seat(
                        hall=obj, 
                        row_number=row, 
                        seat_number=seat, 
                        seat_type=seat_type,
                    )
                    seats.append(seat)
            Seat.objects.bulk_create(seats)

@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ('id', 'hall', 'row_number', 'seat_number', 'seat_type')
    list_filter = ('hall', 'seat_type')
    search_fields = ('hall__name',)

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'movie', 'hall', 'start_at', 'end_at', 'base_price', 'vip_price', 'status')
    list_filter = ('status', 'hall', 'movie')
    search_fields = ('movie__title', 'hall__name')