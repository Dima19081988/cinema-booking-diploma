from django.conf import settings
from django.db import models

class Booking(models.Model):
    class Status(models.TextChoices):
        RESERVED = 'RESERVED', 'Reserved'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        CANCELED = 'CANCELED', 'Canceled'
    
    session = models.ForeignKey('cinema.Session', on_delete=models.CASCADE, related_name='bookings')
    seat = models.ForeignKey('cinema.Seat', on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings',
    )
    guest_name = models.CharField(max_length=255)
    guest_email = models.EmailField(blank=True)
    guest_phone = models.CharField(max_length=30, blank=True)
    booking_code = models.CharField(max_length=50, unique=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.RESERVED
    )
    reserved_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['session', 'seat'], 
                name='unique_booking_per_session_seat',
            )
        ]

    def __str__(self):
        return self.booking_code

class Ticket(models.Model):
    booking = models.OneToOneField(
        Booking, 
        on_delete=models.CASCADE, 
        related_name='ticket'
    )
    qr_payload = models.TextField()
    qr_image = models.ImageField(upload_to='tickets/qr/', blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-issued_at']

    def __str__(self):
        return f'Ticket #{self.id} for {self.booking.booking_code}'


