"""
WebSocket consumers for real-time notifications
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for user notifications
    """

    async def connect(self):
        """
        Handle WebSocket connection
        """
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            # Reject anonymous users
            await self.close()
            return

        # Create unique room name for this user
        self.room_name = f'user_{self.user.id}'
        self.room_group_name = f'notifications_{self.room_name}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to notification stream'
        }))

        # Send unread notification count
        unread_count = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'count': unread_count
        }))

    async def disconnect(self, close_code):
        """
        Handle WebSocket disconnection
        """
        if hasattr(self, 'room_group_name'):
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """
        Receive message from WebSocket (client)
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'mark_as_read':
                # Mark notification as read
                notification_id = data.get('notification_id')
                if notification_id:
                    await self.mark_notification_read(notification_id)
                    await self.send(text_data=json.dumps({
                        'type': 'notification_read',
                        'notification_id': notification_id
                    }))

            elif message_type == 'mark_all_as_read':
                # Mark all notifications as read
                count = await self.mark_all_notifications_read()
                await self.send(text_data=json.dumps({
                    'type': 'all_notifications_read',
                    'count': count
                }))

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))

    async def notification_message(self, event):
        """
        Send notification to WebSocket (server -> client)
        """
        # Send notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))

    @database_sync_to_async
    def get_unread_count(self):
        """Get unread notification count"""
        from .models import Notification
        return Notification.objects.filter(
            recipient=self.user,
            is_read=False
        ).count()

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark single notification as read"""
        from .models import Notification
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=self.user
            )
            notification.mark_as_read()
            return True
        except Notification.DoesNotExist:
            return False

    @database_sync_to_async
    def mark_all_notifications_read(self):
        """Mark all notifications as read"""
        from .models import Notification
        from django.utils import timezone

        count = Notification.objects.filter(
            recipient=self.user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        return count


class BreakingNewsConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for breaking news alerts
    Public channel - no authentication required
    """

    async def connect(self):
        """
        Handle WebSocket connection
        """
        # Public room for breaking news
        self.room_group_name = 'breaking_news'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to breaking news stream'
        }))

    async def disconnect(self, close_code):
        """
        Handle WebSocket disconnection
        """
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Receive message from WebSocket (not used for breaking news)
        """
        # Breaking news is one-way (server -> client)
        pass

    async def breaking_news_alert(self, event):
        """
        Send breaking news alert to WebSocket
        """
        # Send breaking news to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'breaking_news',
            'article': event['article']
        }))
