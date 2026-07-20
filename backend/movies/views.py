from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Movie
from .serializers import MovieListSerializer, MovieDetailSerializer, AdminMovieSerializer


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
    
class AdminMovieListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        movies = Movie.objects.all().order_by('title')
        serializer = AdminMovieSerializer(movies, many=True)
        return Response({'data': serializer.data})
    
    def post(self, request):
        serializer = AdminMovieSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        movie = serializer.save()

        return Response(
            {'data': AdminMovieSerializer(movie).data,}, 
            status=status.HTTP_201_CREATED,
        )

class AdminMovieDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, movie_id):
        movie = get_object_or_404(Movie, id=movie_id)
        serializer = AdminMovieSerializer(movie, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        movie = serializer.save()

        return Response({'data': AdminMovieSerializer(movie).data})
    
    def delete(self, request, movie_id):
        movie = get_object_or_404(Movie, id=movie_id)
        movie.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)