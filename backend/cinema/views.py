from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Hall, Session
from .serializers import (
    AdminHallSerializer,
    AdminSessionSerializer,
    SessionDetailSerializer,
    SessionHallSchemaSerializer,
    SessionListSerializer,
)

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

class AdminHallListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        halls = Hall.objects.all().order_by('name')
        serializer = AdminHallSerializer(halls, many=True)

        return Response({
            'data': serializer.data
        })

class AdminSessionListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        sessions = Session.objects.select_related('movie', 'hall').all().order_by('start_at')
        serializer = AdminSessionSerializer(sessions, many=True)
        return Response({'data': serializer.data})
    
    def post(self, request):
        serializer = AdminSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session= serializer.save()

        return Response(
            {
                'data': AdminSessionSerializer(session).data
            },
            status=status.HTTP_201_CREATED,
        )

class AdminSessionDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, session_id):
        session = get_object_or_404(Session, id=session_id)
        serializer = AdminSessionSerializer(session, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        session = serializer.save()

        return Response({'data': AdminSessionSerializer(session).data})
    
    def delete(self, request, session_id):
        session = get_object_or_404(Session, id=session_id)
        has_bookings = session.bookings.exclude(
            status='CANCELED'
        ).exists()

        if has_bookings:
            return Response(
                {
                    'detail': (
                        'Нельзя удалить сеанс с активными бронированиями. '
                        'Отмените сеанс через изменение статуса.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)