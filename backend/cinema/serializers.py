from rest_framework import serializers

from .models import Hall, Session, Seat

class HallShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hall
        fields = ['id', 'name']

class SessionListSerializer(serializers.ModelSerializer):
    movie_id = serializers.IntegerField(source='movie.id', read_only=True)
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    hall_id = serializers.IntegerField(source='hall.id', read_only=True)
    hall_name = serializers.CharField(source='hall.name', read_only=True)

    class Meta:
        model = Session
        fields = [
            'id',
            'movie_id',
            'movie_title',
            'hall_id',
            'hall_name',
            'start_at',
            'end_at',
            'base_price',
            'vip_price',
            'status',
        ]

class SessionDetailSerializer(serializers.ModelSerializer):
    movie_id = serializers.IntegerField(source='movie.id', read_only=True)
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    hall = HallShortSerializer(read_only=True)
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            'id',
            'movie_id',
            'movie_title',
            'hall',
            'start_at',
            'end_at',
            'base_price',
            'vip_price',
            'status',
            'status_display',
        ]

    def get_status_display(self, obj):
        return obj.get_status_display()
    
class HallSchemaSeatSerializer(serializers.Serializer):
    seat_id = serializers.IntegerField()
    seat_number = serializers.IntegerField()
    seat_type = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    status = serializers.CharField()

class HallSchemaRowSerializer(serializers.Serializer):
    row_number = serializers.IntegerField()
    seats = HallSchemaSeatSerializer(many=True)

class SessionHallSchemaSerializer(serializers.Serializer):
    session_id = serializers.IntegerField(source='id')
    hall = HallShortSerializer(read_only=True)
    rows = serializers.SerializerMethodField()

    def get_rows(self, obj):
        occupied_seat_ids = set(
            obj.bookings.exclude(status='CANCELED').values_list('seat_id', flat=True)
        )

        seats = obj.hall.seats.all().order_by('row_number', 'seat_number')
        grouped_rows = {}

        for seat in seats:
            row_number = seat.row_number

            if row_number not in grouped_rows:
                grouped_rows[row_number] = {
                    'row_number': row_number,
                    'seats': [],
                }
            
            grouped_rows[row_number]['seats'].append({
                'seat_id': seat.id,
                'seat_number': seat.seat_number,
                'seat_type': seat.seat_type,
                'price': obj.vip_price if seat.seat_type == Seat.SeatType.VIP else obj.base_price,
                'status': 'OCCUPIED' if seat.id in occupied_seat_ids else 'AVAILABLE'
            })

        return list(grouped_rows.values())