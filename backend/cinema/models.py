from django.core.exceptions import ValidationError
from django.db import models


class Hall(models.Model):
    name = models.CharField(max_length=100, unique=True)
    rows_count = models.PositiveIntegerField()
    seats_per_row = models.PositiveIntegerField()
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        errors = {}

        if self.rows_count is not None and self.rows_count < 1:
            errors['rows_count'] = 'Количество рядов должно быть больше 0.'

        if self.seats_per_row is not None and self.seats_per_row < 1:
            errors['seats_per_row'] = 'Количество мест в ряду должно быть больше 0.'

        if errors:
            raise ValidationError(errors)
        
    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Seat(models.Model):
    class SeatType(models.TextChoices):
        STANDARD = 'STANDARD', 'Standard'
        VIP = 'VIP', 'VIP'
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, related_name='seats')
    row_number = models.PositiveIntegerField()
    seat_number = models.PositiveIntegerField()
    seat_type = models.CharField(
        max_length=20, 
        choices=SeatType.choices, 
        default=SeatType.STANDARD
    )

    class Meta:
        ordering = ['hall', 'row_number', 'seat_number']
        constraints = [
            models.UniqueConstraint(
                fields=['hall', 'row_number', 'seat_number'], 
                name='unique_seat_per_hall',
            )
        ]

    def clean(self):
        errors = {}

        if not self.hall_id:
            errors['hall'] = 'Нужно выбрать зал.'

        if self.row_number is not None and self.row_number < 1:
            errors['row_number'] = 'Номер ряда должен быть больше 0.'
        elif self.hall_id and self.row_number > self.hall.rows_count:
            errors['row_number'] = f'В зале "{self.hall.name}" только {self.hall.rows_count} ряд(а/ов).'

        if self.seat_number is not None and self.seat_number < 1:
            errors['seat_number'] = 'Номер места должен быть больше 0.'
        elif self.hall_id and self.seat_number > self.hall.seats_per_row:
            errors['seat_number'] = f'В каждом ряду зала "{self.hall.name}" только {self.hall.seats_per_row} мест.'

        if errors:
            raise ValidationError(errors)
        
    def __str__(self):
        return f'{self.hall.name}: row {self.row_number}, seat {self.seat_number}'

class Session(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PUBLISHED = 'PUBLISHED', 'Published'
        CANCELED = 'CANCELED', 'Canceled'
    movie = models.ForeignKey('movies.Movie', on_delete=models.CASCADE, related_name='sessions')
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, related_name='sessions')
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    vip_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_at']

    def clean(self):
        errors = {}
        
        if self.base_price is not None and self.base_price <= 0:
            errors['base_price'] = 'Базовая цена должна быть больше 0.'

        if self.vip_price is not None and self.vip_price <= 0:
            errors['vip_price'] = 'VIP цена должна быть больше 0.'

        if (
            self.base_price is not None and
            self.vip_price is not None and
            self.vip_price < self.base_price
        ):
            errors['vip_price'] = 'VIP цена не может быть меньше базовой.'

        if self.status == self.Status.PUBLISHED:
            if not self.hall_id:
                errors['hall'] = 'Нельзя опубликовать сеанс без зала.'
            if not self.movie_id:
                errors['movie'] = 'Нельзя опубликовать сеанс без фильма.'

        if self.start_at and self.end_at and self.end_at <= self.start_at:
            errors['end_at'] = 'Время окончания сеанса должно быть позже времени начала.'

        if self.hall_id and self.start_at and self.end_at:
            overlapping_sessions = Session.objects.filter(
                hall=self.hall,
                start_at__lt=self.end_at,
                end_at__gt=self.start_at
            )

            if self.pk:
                overlapping_sessions = overlapping_sessions.exclude(pk=self.pk)

            if overlapping_sessions.exists():
                errors['start_at'] = 'В этом зале уже есть пересекающийся сеанс.'
                errors['end_at'] = 'Выбранный интервал времени пересекается с другим сеансом в этом зале.'
                
        if errors:
            raise ValidationError(errors)
        
    def __str__(self):
        return f'{self.movie.title} - {self.start_at:%Y-%m-%d %H:%M}'

