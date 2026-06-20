from django.contrib import admin
from .models import Movie

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'duration_min', 'age_rating', 'is_active', 'release_date')
    list_filter = ('is_active', 'age_rating')
    search_fields = ('title', 'country')
