from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class BookmarkFolder(models.Model):
    """Bookmark klasörleri"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmark_folders', verbose_name='Kullanıcı')
    name = models.CharField(max_length=100, verbose_name='Klasör Adı')
    description = models.TextField(blank=True, verbose_name='Açıklama')
    color = models.CharField(max_length=7, default='#3B82F6', verbose_name='Renk Kodu')  # Hex color
    icon = models.CharField(max_length=50, blank=True, verbose_name='İkon')
    order = models.PositiveIntegerField(default=0, verbose_name='Sıra')
    is_default = models.BooleanField(default=False, verbose_name='Varsayılan')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Bookmark Klasörü'
        verbose_name_plural = 'Bookmark Klasörleri'
        ordering = ['order', 'name']
        unique_together = ['user', 'name']
    
    def __str__(self):
        return f"{self.user.email} - {self.name}"


class Bookmark(models.Model):
    """Kaydedilen haberler"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks', verbose_name='Kullanıcı')
    article = models.ForeignKey('articles.Article', on_delete=models.CASCADE, related_name='bookmarked_by', verbose_name='Haber')
    folder = models.ForeignKey(BookmarkFolder, on_delete=models.CASCADE, null=True, blank=True, related_name='bookmarks', verbose_name='Klasör')
    
    # Kişisel notlar
    note = models.TextField(blank=True, verbose_name='Not')
    tags = models.CharField(max_length=255, blank=True, verbose_name='Etiketler')  # Virgülle ayrılmış
    
    # Hatırlatıcı
    reminder_date = models.DateTimeField(null=True, blank=True, verbose_name='Hatırlatma Tarihi')
    reminder_sent = models.BooleanField(default=False, verbose_name='Hatırlatma Gönderildi')
    
    is_read = models.BooleanField(default=False, verbose_name='Okundu')
    is_favorite = models.BooleanField(default=False, verbose_name='Favori')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Bookmark'
        verbose_name_plural = 'Bookmarks'
        ordering = ['-created_at']
        unique_together = ['user', 'article']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_favorite']),
            models.Index(fields=['user', 'is_read']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.article.title}"


class ReadingHistory(models.Model):
    """Okuma geçmişi"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reading_history', verbose_name='Kullanıcı')
    article = models.ForeignKey('articles.Article', on_delete=models.CASCADE, related_name='read_by', verbose_name='Haber')
    
    # Okuma bilgileri
    read_percentage = models.PositiveIntegerField(default=0, verbose_name='Okuma Yüzdesi')  # 0-100
    scroll_depth = models.PositiveIntegerField(default=0, verbose_name='Scroll Derinliği')  # px
    time_spent = models.PositiveIntegerField(default=0, verbose_name='Geçirilen Süre (sn)')
    
    # Cihaz bilgisi
    device_type = models.CharField(max_length=20, blank=True, verbose_name='Cihaz Tipi')
    
    is_completed = models.BooleanField(default=False, verbose_name='Tamamlandı')
    read_at = models.DateTimeField(auto_now_add=True, verbose_name='Okuma Zamanı')
    last_position = models.TextField(blank=True, verbose_name='Son Konum')  # JSON format
    
    class Meta:
        verbose_name = 'Okuma Geçmişi'
        verbose_name_plural = 'Okuma Geçmişleri'
        ordering = ['-read_at']
        indexes = [
            models.Index(fields=['user', '-read_at']),
            models.Index(fields=['user', 'article']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.article.title}"


class ReadingList(models.Model):
    """Okuma listeleri (Daha sonra oku)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reading_lists', verbose_name='Kullanıcı')
    name = models.CharField(max_length=100, verbose_name='Liste Adı')
    description = models.TextField(blank=True, verbose_name='Açıklama')
    is_public = models.BooleanField(default=False, verbose_name='Herkese Açık')
    is_default = models.BooleanField(default=False, verbose_name='Varsayılan')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Okuma Listesi'
        verbose_name_plural = 'Okuma Listeleri'
        ordering = ['-created_at']
        unique_together = ['user', 'name']
    
    def __str__(self):
        return f"{self.user.email} - {self.name}"


class ReadingListItem(models.Model):
    """Okuma listesi öğeleri"""
    reading_list = models.ForeignKey(ReadingList, on_delete=models.CASCADE, related_name='items', verbose_name='Okuma Listesi')
    article = models.ForeignKey('articles.Article', on_delete=models.CASCADE, verbose_name='Haber')
    order = models.PositiveIntegerField(default=0, verbose_name='Sıra')
    note = models.TextField(blank=True, verbose_name='Not')
    is_read = models.BooleanField(default=False, verbose_name='Okundu')
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Okuma Listesi Öğesi'
        verbose_name_plural = 'Okuma Listesi Öğeleri'
        ordering = ['order', '-added_at']
        unique_together = ['reading_list', 'article']
    
    def __str__(self):
        return f"{self.reading_list.name} - {self.article.title}"
