from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Session
from .serializers import SessionListSerializer, SessionDetailSerializer, SessionHallSchemaSerializer

class PublicSessionListView(APIView):
    def get(self, request):
        queryset = Session.objects.select_related('movie', 'hall').filter(
            status=Session.Status.PUBLISHED,
            movie__is_active=True,
            hall__is_active=True,
        )

        movie_id = request.query_params.get('movie_id')
        hall_id = request.query_params.get('hall_id')

        if movie_id:
            queryset = queryset.filter(movie_id=movie_id)
        if hall_id:
            queryset = queryset.filter(hall_id=hall_id)

        serializer = SessionListSerializer(queryset, many=True)

        return Response({
            'data': serializer.data
        })
    
class PublicSessionDetailView(APIView):
    def get(self, request, session_id):
        session = get_object_or_404(
            Session.objects.select_related('movie', 'hall'),
            id=session_id,
            status=Session.Status.PUBLISHED,
            movie__is_active=True,
            hall__is_active=True,
        )

        serializer = SessionDetailSerializer(session)

        return Response({
            'data': serializer.data
        })
    
class PublicSessionHallSchemaView(APIView):
    def get(self, request, session_id):
        session = get_object_or_404(
            Session.objects.select_related('movie', 'hall').prefetch_related(
                'hall__seats',
                'bookings',
            ),
            id=session_id,
            status=Session.Status.PUBLISHED,
            movie__is_active=True,
            hall__is_active=True,
        )

        serializer = SessionHallSchemaSerializer(session)

        return Response({
            'data': serializer.data
        })
