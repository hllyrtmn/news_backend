from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class SiteSettings(models.Model):
    site_name = models.CharField(max_length=200, default='Haber Sitesi')
    site_description = models.TextField(blank=True)
    site_logo = models.ImageField(upload_to='site/', null=True, blank=True)
    site_favicon = models.ImageField(upload_to='site/', null=True, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    social_facebook = models.URLField(blank=True)
    social_twitter = models.URLField(blank=True)
    social_instagram = models.URLField(blank=True)
    social_youtube = models.URLField(blank=True)
    google_analytics_id = models.CharField(max_length=50, blank=True)
    maintenance_mode = models.BooleanField(default=False)
    items_per_page = models.PositiveIntegerField(default=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Site Ayarları'
        verbose_name_plural = 'Site Ayarları'
    
    def __str__(self):
        return self.site_name

class ContactMessage(models.Model):
    name = models.CharField(max_length=100, verbose_name='İsim')
    email = models.EmailField(verbose_name='Email')
    subject = models.CharField(max_length=200, verbose_name='Konu')
    message = models.TextField(verbose_name='Mesaj')
    is_read = models.BooleanField(default=False, verbose_name='Okundu')
    replied = models.BooleanField(default=False, verbose_name='Cevaplandı')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'İletişim Mesajı'
        verbose_name_plural = 'İletişim Mesajları'
        ordering = ['-created_at']

class Report(models.Model):
    REASON_CHOICES = [
        ('spam', 'Spam'),
        ('offensive', 'Rahatsız Edici'),
        ('fake_news', 'Yanlış Bilgi'),
        ('copyright', 'Telif Hakkı İhlali'),
        ('other', 'Diğer'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Beklemede'),
        ('reviewed', 'İncelendi'),
        ('action_taken', 'İşlem Yapıldı'),
        ('dismissed', 'Reddedildi'),
    ]
    
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    reported_by = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True, blank=True)
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    description = models.TextField(verbose_name='Açıklama')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_reports')
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Şikayet'
        verbose_name_plural = 'Şikayetler'
        ordering = ['-created_at']
