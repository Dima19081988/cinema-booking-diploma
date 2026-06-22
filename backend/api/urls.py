from django.urls import path
from .views import AdminLoginView, AdminTokenRefreshView, MeView

urlpatterns = [
    path('auth/login', AdminLoginView.as_view(), name='admin-login'),
    path('auth/refresh', AdminTokenRefreshView.as_view(), name='admin-refresh'),
    path('auth/me', MeView.as_view(), name='auth-me')
]