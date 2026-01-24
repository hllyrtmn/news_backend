from .models import Notification, NotificationPreference
from django.contrib.contenttypes.models import ContentType
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def send_realtime_notification(user_id, notification_data):
    """
    Send real-time notification via WebSocket
    """
    try:
        channel_layer = get_channel_layer()
        room_group_name = f'notifications_user_{user_id}'

        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                'type': 'notification_message',
                'notification': notification_data
            }
        )
    except Exception as e:
        # Log error but don't fail if WebSocket is not available
        print(f"WebSocket notification failed: {str(e)}")


def send_breaking_news_alert(article_data):
    """
    Send breaking news alert to all connected clients
    """
    try:
        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            'breaking_news',
            {
                'type': 'breaking_news_alert',
                'article': article_data
            }
        )
    except Exception as e:
        print(f"Breaking news alert failed: {str(e)}")


def create_notification(recipient, sender, notification_type, title, message, link='', content_object=None):
    """
    Bildirim oluşturma yardımcı fonksiyonu

    Args:
        recipient: Bildirimi alacak kullanıcı
        sender: Bildirimi gönderen kullanıcı (opsiyonel)
        notification_type: Bildirim tipi (comment, reply, like, etc.)
        title: Bildirim başlığı
        message: Bildirim mesajı
        link: İlgili sayfanın linki
        content_object: İlgili obje (article, comment, etc.)

    Returns:
        Notification: Oluşturulan bildirim objesi
    """
    # Kullanıcının bildirim tercihlerini kontrol et
    try:
        preferences = NotificationPreference.objects.get(user=recipient)

        # In-app bildirim tercihini kontrol et
        inapp_field = f'inapp_on_{notification_type}'
        if hasattr(preferences, inapp_field) and not getattr(preferences, inapp_field):
            return None  # Kullanıcı bu tip bildirimleri almak istemiyor
    except NotificationPreference.DoesNotExist:
        # Tercih yoksa varsayılan olarak bildirim gönder
        pass

    # Content type ve object id'yi belirle
    content_type = None
    object_id = None
    if content_object:
        content_type = ContentType.objects.get_for_model(content_object)
        object_id = content_object.pk

    # Bildirimi oluştur
    notification = Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        title=title,
        message=message,
        link=link,
        content_type=content_type,
        object_id=object_id
    )

    # WebSocket ile gerçek zamanlı bildirim gönder
    notification_data = {
        'id': notification.id,
        'type': notification_type,
        'title': title,
        'message': message,
        'link': link,
        'sender': sender.username if sender else None,
        'created_at': notification.created_at.isoformat()
    }
    send_realtime_notification(recipient.id, notification_data)

    # TODO: Email bildirimi gönder (eğer kullanıcı tercih ediyorsa)
    # send_email_notification(recipient, notification, preferences)

    # TODO: Push bildirimi gönder (eğer kullanıcı tercih ediyorsa)
    # send_push_notification(recipient, notification, preferences)

    return notification


def send_bulk_notification(recipients, sender, notification_type, title, message, link=''):
    """
    Birden fazla kullanıcıya toplu bildirim gönder

    Args:
        recipients: Kullanıcı listesi
        sender: Bildirimi gönderen kullanıcı
        notification_type: Bildirim tipi
        title: Bildirim başlığı
        message: Bildirim mesajı
        link: İlgili sayfanın linki
    """
    notifications = []
    for recipient in recipients:
        notification = create_notification(
            recipient=recipient,
            sender=sender,
            notification_type=notification_type,
            title=title,
            message=message,
            link=link
        )
        if notification:
            notifications.append(notification)

    return notifications


def notify_article_published(article):
    """
    Yeni makale yayınlandığında takipçilere bildirim gönder

    Args:
        article: Yayınlanan makale objesi
    """
    if not article.author:
        return

    # Yazarı takip eden kullanıcıları bul (eğer Follow modeliniz varsa)
    try:
        from apps.interactions.models import Follow
        followers = Follow.objects.filter(
            following=article.author
        ).select_related('follower')

        recipients = [follow.follower.user for follow in followers]

        send_bulk_notification(
            recipients=recipients,
            sender=article.author.user,
            notification_type='article',
            title='Yeni Makale',
            message=f'{article.author.display_name} yeni bir makale yayınladı: {article.title}',
            link=f'/articles/{article.slug}'
        )
    except ImportError:
        # Follow modeli yoksa pass
        pass
