from django.db import models

class Movie(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration_min = models.PositiveIntegerField()
    age_rating = models.CharField(max_length=10, blank=True)
    poster_url = models.URLField(blank=True)
    country = models.CharField(max_length=100, blank=True)
    release_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title