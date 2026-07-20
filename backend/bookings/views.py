from io import BytesIO

import qrcode
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.core.files.base import ContentFile
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from .models import Booking, Ticket
from .serializers import (
    BookingCreateSerializer,
    BookingDetailSerializer,
    TicketSerializer,
    AdminBookingListSerializer,
    AdminBookingStatusUpdateSerializer
    )

def build_ticket_payload(booking):
    return(
        f'booking_code={booking.booking_code};'
        f'session_id={booking.session_id};'
        f'session_start={booking.session.start_at.isoformat()};'
        f'row={booking.seat.row_number};'
        f'seat={booking.seat.seat_number};'
        f'seat_type={booking.seat.seat_type};'
        f'status={booking.status}'
    )

def generate_qr_png_bytes(payload):
    qr = qrcode.QRCode(
        version=1,
        box_size=10,
        border=4,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
    )
    qr.add_data(payload)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    return buffer.getvalue()

def save_ticket_qr_image(ticket):
    png_bytes = generate_qr_png_bytes(ticket.qr_payload)
    file_name = f'booking-{ticket.booking_id}-qr.png'

    ticket.qr_image.save(
        file_name,
        ContentFile(png_bytes),
        save=False,
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
            Booking.objects.select_related('session', 'seat', 'ticket'),
            id=booking_id
        )

        if hasattr(booking, 'ticket') and booking.ticket.qr_image:
            booking.ticket.qr_image.open('rb')
            return HttpResponse(
                booking.ticket.qr_image.read(),
                content_type='image/png'
            )

        if hasattr(booking, 'ticket') and booking.ticket.qr_payload:
            qr_data = booking.ticket.qr_payload
        else:
            qr_data = build_ticket_payload(booking)

        png_bytes = generate_qr_png_bytes(qr_data)

        response = HttpResponse(png_bytes, content_type='image/png')
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
    
class PublicBookingTicketView(APIView):
    def get(self, request, booking_id):
        booking = get_object_or_404(
            Booking.objects.select_related('ticket'),
            id=booking_id,
        )

        if not hasattr(booking, 'ticket'):
            return Response(
                {'detail': 'Билет для этой брони ещё не создан.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = TicketSerializer(
            booking.ticket,
            context={'request': request},
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
        booking = get_object_or_404(
            Booking.objects.select_related('session', 'seat'),
            id=booking_id
        )

        serializer = AdminBookingStatusUpdateSerializer(
            booking,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        booking.refresh_from_db()

        if booking.status == Booking.Status.CONFIRMED:
            payload = build_ticket_payload(booking)

            ticket, created = Ticket.objects.get_or_create(
                booking=booking,
                defaults={
                    'qr_payload': payload,
                }
            )

            should_update_ticket = created or ticket.qr_payload != payload or not ticket.qr_image

            if should_update_ticket:
                ticket.qr_payload = payload
                save_ticket_qr_image(ticket)
                ticket.save()

        return Response({
            'data': {
                'id': booking_id,
                'booking_code': booking.booking_code,
                'status': serializer.instance.status,
            }
        })