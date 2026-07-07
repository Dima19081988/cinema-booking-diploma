from io import BytesIO

import qrcode
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from .models import Booking
from .serializers import (
    BookingCreateSerializer,
    BookingDetailSerializer,
    AdminBookingListSerializer,
    AdminBookingStatusUpdateSerializer
    )

class PublicBookingCreateView(APIView):
    def post(self, request):
        serializer = BookingCreateSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        
        booking = serializer.save()

        return Response(
            {
            'data': BookingCreateSerializer(booking).data
            },
            status=status.HTTP_201_CREATED,
        )

class PublicBookingDetailView(APIView):
    def get(self, request, booking_id):
        booking = get_object_or_404(
            Booking.objects.select_related('session', 'seat'),
            id=booking_id,
        )

        serializer = BookingDetailSerializer(
            booking,
            context={'request': request}
        )

        return Response({'data': serializer.data})

class PublicBookingQrView(APIView):
    def get(self, request, booking_id):
        booking = get_object_or_404(
            Booking, id=booking_id
        )

        qr_data = (
            f'booking_code={booking.booking_code};'
            f'booking_id={booking.id};'
            f'status={booking.status}'
        )

        qr = qrcode.QRCode(
            version=1,
            box_size=10,
            border=4,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)

        response = HttpResponse(buffer.getvalue(), content_type='image/png')
        response['Content-Disposition'] = f'inline; filename="booking-{booking.id}-qr.png"'
        return response
    
class PublicBookingByCodeView(APIView):
    def get(self, request, booking_code):
        booking = get_object_or_404(
            Booking.objects.select_related('session', 'seat'), 
            booking_code=booking_code,
        )

        serializer = BookingDetailSerializer(
            booking,
            context={'request': request}
        )

        return Response({'data': serializer.data})
    
class AdminBookingListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        bookings = Booking.objects.select_related('session', 'seat').all().order_by('-created_at')
        serializer = AdminBookingListSerializer(
            bookings,
            many=True,
        )
        return Response({
            'data': serializer.data
        })
    
class AdminBookingStatusUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)

        serializer = AdminBookingStatusUpdateSerializer(
            booking,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            'data': {
                'id': booking_id,
                'booking_code': booking.booking_code,
                'status': serializer.instance.status,
            }
        })