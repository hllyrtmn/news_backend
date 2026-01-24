from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

User = get_user_model()


class Notification(models.Model):
    """
    Bildirim modeli - Kullanıcılara gönderilen bildirimler
    """
    NOTIFICATION_TYPES = [
        ('comment', 'Yorum'),
        ('reply', 'Yanıt'),
        ('like', 'Beğeni'),
        ('follow', 'Takip'),
        ('article', 'Yeni Makale'),
        ('mention', 'Bahsetme'),
        ('system', 'Sistem'),
    ]

    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name='Alıcı'
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_notifications',
        null=True,
        blank=True,
        verbose_name='Gönderen'
    )

    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        verbose_name='Bildirim Tipi'
    )
    title = models.CharField(max_length=255, verbose_name='Başlık')
    message = models.TextField(verbose_name='Mesaj')

    # Generic relation to any model (article, comment, etc.)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    # Metadata
    is_read = models.BooleanField(default=False, verbose_name='Okundu mu?')
    link = models.CharField(
        max_length=500,
        blank=True,
        verbose_name='Link'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Oluşturulma Tarihi')
    read_at = models.DateTimeField(null=True, blank=True, verbose_name='Okunma Tarihi')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Bildirim'
        verbose_name_plural = 'Bildirimler'
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read']),
        ]

    def __str__(self):
        return f"{self.recipient.username} - {self.title}"

    def mark_as_read(self):
        """Bildirimi okundu olarak işaretle"""
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])


class NotificationPreference(models.Model):
    """
    Kullanıcı bildirim tercihleri
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='notification_preferences',
        verbose_name='Kullanıcı'
    )

    # Email notifications
    email_on_comment = models.BooleanField(default=True, verbose_name='Yorum Email')
    email_on_reply = models.BooleanField(default=True, verbose_name='Yanıt Email')
    email_on_like = models.BooleanField(default=False, verbose_name='Beğeni Email')
    email_on_follow = models.BooleanField(default=True, verbose_name='Takip Email')
    email_on_mention = models.BooleanField(default=True, verbose_name='Bahsetme Email')

    # Push notifications
    push_on_comment = models.BooleanField(default=True, verbose_name='Yorum Push')
    push_on_reply = models.BooleanField(default=True, verbose_name='Yanıt Push')
    push_on_like = models.BooleanField(default=True, verbose_name='Beğeni Push')
    push_on_follow = models.BooleanField(default=True, verbose_name='Takip Push')
    push_on_mention = models.BooleanField(default=True, verbose_name='Bahsetme Push')

    # In-app notifications
    inapp_on_comment = models.BooleanField(default=True, verbose_name='Yorum In-App')
    inapp_on_reply = models.BooleanField(default=True, verbose_name='Yanıt In-App')
    inapp_on_like = models.BooleanField(default=True, verbose_name='Beğeni In-App')
    inapp_on_follow = models.BooleanField(default=True, verbose_name='Takip In-App')
    inapp_on_mention = models.BooleanField(default=True, verbose_name='Bahsetme In-App')

    class Meta:
        verbose_name = 'Bildirim Tercihi'
        verbose_name_plural = 'Bildirim Tercihleri'

    def __str__(self):
        return f"{self.user.username} - Bildirim Tercihleri"
