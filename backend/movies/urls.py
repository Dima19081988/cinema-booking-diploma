from django.urls import path
from .views import MovieListView, MovieDetailView

urlpatterns = [
    path('movies', MovieListView.as_view(), name='movies-list'),
    path('movies/<int:movie_id>', MovieDetailView.as_view(), name='movies-detail',)
]