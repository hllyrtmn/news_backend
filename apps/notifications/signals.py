from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification, NotificationPreference
from .utils import create_notification


@receiver(post_save, sender='accounts.CustomUser')
def create_notification_preferences(sender, instance, created, **kwargs):
    """Yeni kullanıcı oluşturulduğunda bildirim tercihlerini oluştur"""
    if created:
        NotificationPreference.objects.get_or_create(user=instance)


# Yorum bildirimi
@receiver(post_save, sender='comments.Comment')
def notify_on_comment(sender, instance, created, **kwargs):
    """Makaleye yorum yapıldığında yazara bildirim gönder"""
    if created and instance.article.author:
        # Kullanıcı kendi makalesine yorum yaptıysa bildirim gönderme
        if instance.user != instance.article.author.user:
            create_notification(
                recipient=instance.article.author.user,
                sender=instance.user,
                notification_type='comment',
                title='Yeni Yorum',
                message=f'{instance.user.get_full_name() or instance.user.username} makalenize yorum yaptı',
                link=f'/articles/{instance.article.slug}#comment-{instance.id}',
                content_object=instance
            )

        # Yanıt ise, üst yorumun sahibine de bildirim gönder
        if instance.parent and instance.parent.user != instance.user:
            create_notification(
                recipient=instance.parent.user,
                sender=instance.user,
                notification_type='reply',
                title='Yeni Yanıt',
                message=f'{instance.user.get_full_name() or instance.user.username} yorumunuza yanıt verdi',
                link=f'/articles/{instance.article.slug}#comment-{instance.id}',
                content_object=instance
            )


# Beğeni bildirimi (varsa Like model'iniz)
@receiver(post_save, sender='interactions.Like')
def notify_on_like(sender, instance, created, **kwargs):
    """Makale beğenildiğinde yazara bildirim gönder"""
    if created and instance.article.author:
        # Kullanıcı kendi makalesini beğendiyse bildirim gönderme
        if instance.user != instance.article.author.user:
            create_notification(
                recipient=instance.article.author.user,
                sender=instance.user,
                notification_type='like',
                title='Yeni Beğeni',
                message=f'{instance.user.get_full_name() or instance.user.username} makalenizi beğendi',
                link=f'/articles/{instance.article.slug}',
                content_object=instance
            )
