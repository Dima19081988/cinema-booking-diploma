from datetime import timedelta
import uuid

from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import serializers

from .models import Booking, Ticket
from cinema.models import Session, Seat

class BookingCreateSerializer(serializers.ModelSerializer):
    session_id = serializers.IntegerField(write_only=True)
    seat_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'session_id',
            'seat_id',
            'guest_name',
            'guest_email',
            'guest_phone',
            'booking_code',
            'status',
            'expires_at',
            'reserved_at',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'booking_code',
            'status',
            'expires_at',
            'reserved_at',
            'created_at',
        ]

    def validate(self, attrs):
        session_id = attrs.get('session_id')
        seat_id = attrs.get('seat_id')

        try:
            session = Session.objects.select_related('hall').get(id=session_id)
        except Session.DoesNotExist:
            raise serializers.ValidationError({ 'session_id': 'Сессия не найдена' })
            
        try:
            seat = Seat.objects.select_related('hall').get(id=seat_id)
        except Seat.DoesNotExist:
            raise serializers.ValidationError({ 'seat_id': 'Место не найдено ' })
            
        if seat.hall_id != session.hall_id:
            raise serializers.ValidationError({ 
                'seat_id': 'Это место не принадлежит залу с этой сессией'
            })
            
        existing_booking = Booking.objects.filter(
            session=session,
            seat=seat,
        ).exclude(
            status=Booking.Status.CANCELED
        ).first()

        if existing_booking:
            raise serializers.ValidationError({
                'seat_id': 'Это место уже занято для этой сессии'
            })

        attrs['session'] = session
        attrs['seat'] = seat
        return attrs
        
    def create(self, validated_data):
        session = validated_data.pop('session')
        seat = validated_data.pop('seat')
        validated_data.pop('session_id', None)
        validated_data.pop('seat_id', None)

        user = self.context['request'].user if self.context.get('request') and self.context['request'].user.is_authenticated else None

        try:
            with transaction.atomic():
                booking = Booking.objects.create(
                    session=session,
                    seat=seat,
                    user=user,
                    booking_code=uuid.uuid4().hex[:12].upper(),
                    status=Booking.Status.RESERVED,
                    expires_at=timezone.now() + timedelta(minutes=15),
                    **validated_data,
                )
        except IntegrityError:
            raise serializers.ValidationError({
                'seat_id': 'Место уже забронировано другим пользователем'
            })
        return booking

class BookingSeatSerializer(serializers.ModelSerializer):
    seat_id = serializers.IntegerField(source='id', read_only=True)
    price = serializers.SerializerMethodField()

    class Meta:
        model = Seat
        fields = [
            'seat_id',
            'row_number',
            'seat_number',
            'seat_type',
            'price',
        ]

    def get_price(self, obj):
        booking = self.parent.instance
        session = booking.session

        if obj.seat_type == Seat.SeatType.VIP:
            return session.vip_price

        return session.base_price
    
class BookingSessionSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    hall_name = serializers.CharField(source='hall.name', read_only=True)

    class Meta:
        model = Session
        fields = [
            'id',
            'movie_title',
            'start_at',
            'end_at',
            'hall_name',
            'base_price',
            'vip_price',
        ]

class BookingDetailSerializer(serializers.ModelSerializer):
    qr_url = serializers.SerializerMethodField()
    session = BookingSessionSerializer(read_only=True)
    seat = BookingSeatSerializer(read_only=True)
    session_id = serializers.IntegerField(read_only=True)
    seat_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'session_id',
            'seat_id',
            'session',
            'seat',
            'guest_name',
            'guest_email',
            'guest_phone',
            'booking_code',
            'status',
            'expires_at',
            'reserved_at',
            'created_at',
            'qr_url',
        ]

    def get_qr_url(self, obj):
        request = self.context.get('request')
        path = f'/api/v1/bookings/{obj.id}/qr'
        if request is None:
            return path
        return request.build_absolute_uri(path)
    
class TicketSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(source='booking.id', read_only=True)
    booking_code = serializers.CharField(source='booking.booking_code', read_only=True)
    qr_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            'id',
            'booking_id',
            'booking_code',
            'qr_payload',
            'qr_image_url',
            'issued_at',
        ]
    
    def get_qr_image_url(self, obj):
        request = self.context.get('request')

        if obj.qr_image and hasattr(obj.qr_image, 'url'):
            if request:
                return request.build_absolute_uri(obj.qr_image.url)
            return obj.qr_image.url
        
        return None
    
class AdminBookingListSerializer(serializers.ModelSerializer):
    session_id = serializers.IntegerField(read_only=True)
    seat_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'session_id',
            'seat_id',
            'guest_name',
            'guest_email',
            'guest_phone',
            'booking_code',
            'status',
            'expires_at',
            'reserved_at',
            'created_at',
        ]

class AdminBookingStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'status',
        ]
    