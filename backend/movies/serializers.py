from rest_framework import serializers
from .models import Movie

class MovieListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['id', 'title', 'duration_min', 'age_rating', 'poster_url']

class MovieDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = [
            'id',
            'title',
            'description',
            'duration_min',
            'age_rating',
            'poster_url',
            'country',
            'release_date',
        ]

class AdminMovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = [
            'id',
            'title',
            'description',
            'duration_min',
            'age_rating',
            'poster_url',
            'country',
            'release_date',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']