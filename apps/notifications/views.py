from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Notification, NotificationPreference
from .serializers import NotificationSerializer, NotificationPreferenceSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Bildirim ViewSet
    - list: Kullanıcının tüm bildirimlerini listele
    - retrieve: Tek bir bildirimi getir
    - mark_as_read: Bildirimi okundu olarak işaretle
    - mark_all_as_read: Tüm bildirimleri okundu olarak işaretle
    - unread_count: Okunmamış bildirim sayısı
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Sadece kullanıcının kendi bildirimlerini getir"""
        return Notification.objects.filter(
            recipient=self.request.user
        ).select_related('sender', 'content_type')

    def retrieve(self, request, *args, **kwargs):
        """Bildirim detayını getir ve okundu olarak işaretle"""
        instance = self.get_object()
        instance.mark_as_read()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Tek bir bildirimi okundu olarak işaretle"""
        notification = self.get_object()
        notification.mark_as_read()
        return Response({
            'status': 'success',
            'message': 'Bildirim okundu olarak işaretlendi'
        })

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Tüm bildirimleri okundu olarak işaretle"""
        updated_count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        return Response({
            'status': 'success',
            'message': f'{updated_count} bildirim okundu olarak işaretlendi',
            'count': updated_count
        })

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Okunmamış bildirim sayısı"""
        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': count})

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Okunmamış bildirimleri listele"""
        notifications = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).select_related('sender', 'content_type')[:20]
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)


class NotificationPreferenceViewSet(viewsets.GenericViewSet):
    """
    Bildirim tercihleri ViewSet
    - get: Kullanıcının bildirim tercihlerini getir
    - update: Bildirim tercihlerini güncelle
    """
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Kullanıcının bildirim tercihlerini getir veya oluştur"""
        obj, created = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return obj

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Kullanıcının kendi bildirim tercihlerini getir"""
        preferences = self.get_object()
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)

    @action(detail=False, methods=['put', 'patch'])
    def update_preferences(self, request):
        """Bildirim tercihlerini güncelle"""
        preferences = self.get_object()
        serializer = self.get_serializer(
            preferences,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'status': 'success',
            'message': 'Bildirim tercihleri güncellendi',
            'data': serializer.data
        })
