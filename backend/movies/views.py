from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Movie
from .serializers import MovieListSerializer, MovieDetailSerializer


class MovieListView(APIView):
    def get(self, request):
        queryset = Movie.objects.filter(is_active=True)

        search = request.query_params.get('search')

        if search:
            queryset = queryset.filter(title__icontains=search)
        
        serializer = MovieListSerializer(queryset, many=True)

        return Response({
            'data': serializer.data 
        })

class MovieDetailView(APIView):
    def get(self, request, movie_id):
        movie = get_object_or_404(Movie, id=movie_id, is_active=True)
        serializer = MovieDetailSerializer(movie)

        return Response({
            'data': serializer.data
        })