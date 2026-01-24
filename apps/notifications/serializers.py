from rest_framework import serializers
from .models import Notification, NotificationPreference
from apps.accounts.serializers import UserSerializer


class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    time_since = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'sender', 'notification_type', 'title', 'message',
            'link', 'is_read', 'created_at', 'read_at', 'time_since'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']

    def get_time_since(self, obj):
        """Bildirim ne kadar zaman önce oluşturuldu"""
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        diff = now - obj.created_at

        if diff < timedelta(minutes=1):
            return 'Az önce'
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f'{minutes} dakika önce'
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f'{hours} saat önce'
        elif diff < timedelta(days=30):
            days = diff.days
            return f'{days} gün önce'
        elif diff < timedelta(days=365):
            months = int(diff.days / 30)
            return f'{months} ay önce'
        else:
            years = int(diff.days / 365)
            return f'{years} yıl önce'


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'email_on_comment', 'email_on_reply', 'email_on_like',
            'email_on_follow', 'email_on_mention',
            'push_on_comment', 'push_on_reply', 'push_on_like',
            'push_on_follow', 'push_on_mention',
            'inapp_on_comment', 'inapp_on_reply', 'inapp_on_like',
            'inapp_on_follow', 'inapp_on_mention',
        ]
