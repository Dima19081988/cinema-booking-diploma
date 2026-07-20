from django.urls import path
from .views import MovieListView, MovieDetailView, AdminMovieListCreateView, AdminMovieDetailView

urlpatterns = [
## public ##
    path('movies/', MovieListView.as_view(), name='movies-list'),
    path('movies/<int:movie_id>/', MovieDetailView.as_view(), name='movies-detail'),
## admin ##
    path('admin/movies/', AdminMovieListCreateView.as_view(), name='admin-movies-list-create'),
    path('admin/movies/<int:movie_id>/', AdminMovieDetailView.as_view(), name='admin-movies-detail'),
]