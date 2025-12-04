from django.db import models

class Newsletter(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Günlük'),
        ('weekly', 'Haftalık'),
        ('monthly', 'Aylık'),
    ]
    
    name = models.CharField(max_length=200, verbose_name='Bülten Adı')
    description = models.TextField(blank=True, verbose_name='Açıklama')
    category = models.ForeignKey('categories.Category', on_delete=models.SET_NULL, null=True, blank=True)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, verbose_name='Sıklık')
    template = models.TextField(blank=True, verbose_name='Email Şablonu')
    is_active = models.BooleanField(default=True, verbose_name='Aktif')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Newsletter'
        verbose_name_plural = 'Newsletterlar'

class NewsletterSubscription(models.Model):
    email = models.EmailField(verbose_name='Email')
    user = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, null=True, blank=True)
    newsletter = models.ForeignKey(Newsletter, on_delete=models.CASCADE, related_name='subscriptions')
    is_verified = models.BooleanField(default=False, verbose_name='Doğrulandı')
    is_active = models.BooleanField(default=True, verbose_name='Aktif')
    subscribed_at = models.DateTimeField(auto_now_add=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Newsletter Aboneliği'
        verbose_name_plural = 'Newsletter Abonelikleri'
        unique_together = ['email', 'newsletter']
