from django.urls import path

from .views import PublicSessionListView, PublicSessionDetailView, PublicSessionHallSchemaView

urlpatterns = [
    path('sessions', PublicSessionListView.as_view(), name='public-session-list'),
    path('sessions/<int:session_id>/hall-schema', PublicSessionHallSchemaView.as_view(), name='public-session-hall-schema'),
    path('sessions/<int:session_id>', PublicSessionDetailView.as_view(), name='public-session-detail'),
]
