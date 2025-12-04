from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Media(models.Model):
    FILE_TYPES = [
        ('image', 'Görsel'),
        ('video', 'Video'),
        ('audio', 'Ses'),
        ('document', 'Doküman'),
    ]
    
    title = models.CharField(max_length=255, verbose_name='Başlık')
    alt_text = models.CharField(max_length=255, blank=True, verbose_name='Alt Text')
    caption = models.TextField(blank=True, verbose_name='Açıklama')
    file = models.FileField(upload_to='media/%Y/%m/', verbose_name='Dosya')
    thumbnail = models.ImageField(upload_to='thumbnails/%Y/%m/', null=True, blank=True)
    file_type = models.CharField(max_length=20, choices=FILE_TYPES, verbose_name='Dosya Tipi')
    mime_type = models.CharField(max_length=100, blank=True)
    file_size = models.PositiveIntegerField(default=0, verbose_name='Dosya Boyutu (bytes)')
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    duration = models.PositiveIntegerField(null=True, blank=True, verbose_name='Süre (saniye)')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_media')
    copyright_holder = models.CharField(max_length=255, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Medya'
        verbose_name_plural = 'Medya Dosyaları'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
