from rest_framework import serializers

from django.core.exceptions import ValidationError as DjangoValidationError

from .models import Hall, Session, Seat

class HallShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hall
        fields = ['id', 'name']

class AdminHallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hall
        fields = [
            'id',
            'name',
            'rows_count',
            'seats_per_row',
            'is_active',
        ]

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
    hall_id = serializers.IntegerField(source='hall.id', read_only=True)
    hall_name = serializers.CharField(source='hall.name', read_only=True)
    status_display = serializers.SerializerMethodField()

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
    
class AdminSessionSerializer(serializers.ModelSerializer):
    movie_id = serializers.IntegerField()
    hall_id = serializers.IntegerField()

    class Meta:
        model = Session
        fields = [
            'id',
            'movie_id',
            'hall_id',
            'start_at',
            'end_at',
            'base_price',
            'vip_price',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        instance = getattr(self, 'instance', None)

        movie_id = attrs.get('movie_id', getattr(instance, 'movie_id', None))
        hall_id = attrs.get('hall_id', getattr(instance, 'hall_id', None))
        start_at = attrs.get('start_at', getattr(instance, 'start_at', None))
        end_at = attrs.get('end_at', getattr(instance, 'end_at', None))
        base_price = attrs.get('base_price', getattr(instance, 'base_price', None))
        vip_price = attrs.get('vip_price', getattr(instance, 'vip_price', None))
        status_value = attrs.get('status', getattr(instance, 'status', Session.Status.DRAFT))

        temp_session = Session(
            movie_id=movie_id,
            hall_id=hall_id,
            start_at=start_at,
            end_at=end_at,
            base_price=base_price,
            vip_price=vip_price,
            status=status_value,
        )

        if instance:
            temp_session.pk = instance.pk

        try:
            temp_session.clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict)

        return attrs
    
    def create(self, validated_data):
        movie_id = validated_data.pop('movie_id')
        hall_id = validated_data.pop('hall_id')

        return Session.objects.create(
            movie_id=movie_id,
            hall_id=hall_id,
            **validated_data
        )
    
    def update(self, instance, validated_data):
        if 'movie_id' in validated_data:
            instance.movie_id = validated_data.pop('movie_id')
        if 'hall_id' in validated_data:
            instance.hall_id = validated_data.pop('hall_id')
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance