from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import BookingCreateSerializer

class PublicBookingCreateView(APIView):
    def post(self, request):
        serializer = BookingCreateSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        
        booking = serializer.save()

        return Response(
            {
            'data': BookingCreateSerializer(booking).data
            },
            status=status.HTTP_201_CREATED,
        )
        