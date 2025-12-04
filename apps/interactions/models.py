from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Like(models.Model):
    """Beğeni modeli"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes', verbose_name='Kullanıcı')
    article = models.ForeignKey('articles.Article', on_delete=models.CASCADE, related_name='likes', verbose_name='Haber')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Beğenilme Tarihi')
    
    class Meta:
        verbose_name = 'Beğeni'
        verbose_name_plural = 'Beğeniler'
        unique_together = ['user', 'article']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['article', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.article.title}"


class Share(models.Model):
    """Paylaşım modeli"""
    PLATFORM_CHOICES = [
        ('facebook', 'Facebook'),
        ('twitter', 'Twitter'),
        ('linkedin', 'LinkedIn'),
        ('whatsapp', 'WhatsApp'),
        ('email', 'E-posta'),
        ('copy', 'Link Kopyala'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='shares', verbose_name='Kullanıcı')
    article = models.ForeignKey('articles.Article', on_delete=models.CASCADE, related_name='shares', verbose_name='Haber')
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, verbose_name='Platform')
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name='IP Adresi')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Paylaşım Tarihi')
    
    class Meta:
        verbose_name = 'Paylaşım'
        verbose_name_plural = 'Paylaşımlar'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['article', '-created_at']),
            models.Index(fields=['platform', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.article.title} - {self.get_platform_display()}"


# Bookmark ve ReadHistory modelleri bookmarks app'ine taşındı
# Artık apps.bookmarks.models kullanın