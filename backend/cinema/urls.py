from django.urls import path

from .views import (
    AdminHallListView,
    AdminSessionDetailView,
    AdminSessionListCreateView,
    PublicSessionDetailView,
    PublicSessionHallSchemaView,
    PublicSessionListView,
)

urlpatterns = [
## public ##
    path('sessions/', PublicSessionListView.as_view(), name='public-session-list'),
    path('sessions/<int:session_id>/hall-schema/', PublicSessionHallSchemaView.as_view(), name='public-session-hall-schema'),
    path('sessions/<int:session_id>/', PublicSessionDetailView.as_view(), name='public-session-detail'),
## admin ##
    path('admin/halls/', AdminHallListView.as_view(), name='admin-hall-list'),
    path('admin/sessions/', AdminSessionListCreateView.as_view(), name='admin-session-list-create'),
    path('admin/sessions/<int:session_id>/', AdminSessionDetailView.as_view(), name='admin-session-detail')
]
