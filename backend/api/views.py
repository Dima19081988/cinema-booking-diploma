from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

from .serializers import AdminLoginSerializer

class AdminLoginView(TokenObtainPairView):
    serializer_class = AdminLoginSerializer

class AdminTokenRefreshView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response({
            'data': {
                'access': serializer.validated_data['access'],
            }
        })

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            'data': {
                'id': user.id,
                'email': user.email,
                'role': 'ADMIN' if user.is_staff else 'USER',
            }
        })
