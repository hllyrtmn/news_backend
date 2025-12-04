from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ArticleView(models.Model):
    DEVICE_CHOICES = [
        ('mobile', 'Mobil'),
        ('tablet', 'Tablet'),
        ('desktop', 'Masaüstü'),
    ]
    
    article = models.ForeignKey('articles.Article', on_delete=models.CASCADE, related_name='view_records')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    referrer = models.URLField(max_length=500, blank=True)
    device_type = models.CharField(max_length=20, choices=DEVICE_CHOICES, blank=True)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Haber Görüntülenme'
        verbose_name_plural = 'Haber Görüntülenmeler'
        ordering = ['-viewed_at']
        indexes = [
            models.Index(fields=['article', '-viewed_at']),
            models.Index(fields=['user', '-viewed_at']),
        ]

class PopularArticle(models.Model):
    PERIOD_CHOICES = [
        ('daily', 'Günlük'),
        ('weekly', 'Haftalık'),
        ('monthly', 'Aylık'),
        ('all_time', 'Tüm Zamanlar'),
    ]
    
    article = models.ForeignKey('articles.Article', on_delete=models.CASCADE, related_name='popularity_records')
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES)
    views_count = models.PositiveIntegerField(default=0)
    shares_count = models.PositiveIntegerField(default=0)
    score = models.FloatField(default=0.0, verbose_name='Popülerlik Skoru')
    date = models.DateField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Popüler Haber'
        verbose_name_plural = 'Popüler Haberler'
        ordering = ['-score', '-views_count']
        unique_together = ['article', 'period', 'date']
        indexes = [
            models.Index(fields=['period', '-score']),
        ]

class SocialShare(models.Model):
    PLATFORM_CHOICES = [
        ('facebook', 'Facebook'),
        ('twitter', 'Twitter'),
        ('linkedin', 'LinkedIn'),
        ('whatsapp', 'WhatsApp'),
    ]
    
    article = models.ForeignKey('articles.Article', on_delete=models.CASCADE, related_name='social_shares')
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    share_count = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Sosyal Medya Paylaşımı'
        verbose_name_plural = 'Sosyal Medya Paylaşımları'
        unique_together = ['article', 'platform']
