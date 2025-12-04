from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class AdvertisementZone(models.Model):
    """Reklam bölgeleri (Banner, Sidebar, In-Article vb.)"""
    ZONE_TYPES = [
        ('banner_top', 'Üst Banner'),
        ('banner_bottom', 'Alt Banner'),
        ('sidebar_top', 'Sidebar Üst'),
        ('sidebar_middle', 'Sidebar Orta'),
        ('sidebar_bottom', 'Sidebar Alt'),
        ('in_article_top', 'Makale İçi Üst'),
        ('in_article_middle', 'Makale İçi Orta'),
        ('in_article_bottom', 'Makale İçi Alt'),
        ('floating', 'Floating/Sticky'),
        ('popup', 'Pop-up'),
        ('interstitial', 'Tam Sayfa'),
        ('native', 'Native/İçerik Arası'),
    ]
    
    name = models.CharField(max_length=100, unique=True, verbose_name='Bölge Adı')
    zone_type = models.CharField(max_length=50, choices=ZONE_TYPES, verbose_name='Bölge Tipi')
    width = models.PositiveIntegerField(verbose_name='Genişlik (px)')
    height = models.PositiveIntegerField(verbose_name='Yükseklik (px)')
    description = models.TextField(blank=True, verbose_name='Açıklama')
    is_active = models.BooleanField(default=True, verbose_name='Aktif')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Reklam Bölgesi'
        verbose_name_plural = 'Reklam Bölgeleri'
        ordering = ['zone_type', 'name']
    
    def __str__(self):
        return f"{self.get_zone_type_display()} - {self.name}"


class Advertiser(models.Model):
    """Reklamverenler"""
    name = models.CharField(max_length=200, verbose_name='Firma Adı')
    email = models.EmailField(verbose_name='E-posta')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Telefon')
    website = models.URLField(blank=True, verbose_name='Web Sitesi')
    contact_person = models.CharField(max_length=100, blank=True, verbose_name='İlgili Kişi')
    tax_number = models.CharField(max_length=50, blank=True, verbose_name='Vergi Numarası')
    address = models.TextField(blank=True, verbose_name='Adres')
    notes = models.TextField(blank=True, verbose_name='Notlar')
    is_active = models.BooleanField(default=True, verbose_name='Aktif')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Reklamveren'
        verbose_name_plural = 'Reklamverenler'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Campaign(models.Model):
    """Reklam Kampanyaları"""
    STATUS_CHOICES = [
        ('draft', 'Taslak'),
        ('scheduled', 'Planlandı'),
        ('active', 'Aktif'),
        ('paused', 'Duraklatıldı'),
        ('completed', 'Tamamlandı'),
        ('cancelled', 'İptal Edildi'),
    ]
    
    PRICING_MODELS = [
        ('cpm', 'CPM (Bin Gösterim)'),
        ('cpc', 'CPC (Tıklama Başına)'),
        ('cpa', 'CPA (Eylem Başına)'),
        ('flat', 'Sabit Ücret'),
    ]
    
    name = models.CharField(max_length=200, verbose_name='Kampanya Adı')
    advertiser = models.ForeignKey(Advertiser, on_delete=models.CASCADE, related_name='campaigns', verbose_name='Reklamveren')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='Durum')
    
    pricing_model = models.CharField(max_length=20, choices=PRICING_MODELS, verbose_name='Fiyatlandırma Modeli')
    budget = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], verbose_name='Bütçe (₺)')
    spent = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)], verbose_name='Harcanan (₺)')
    
    # CPM/CPC/CPA için fiyatlar
    cpm_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, verbose_name='CPM Fiyatı (₺)')
    cpc_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, verbose_name='CPC Fiyatı (₺)')
    cpa_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, verbose_name='CPA Fiyatı (₺)')
    
    # Kampanya limitleri
    max_impressions = models.PositiveIntegerField(null=True, blank=True, verbose_name='Maksimum Gösterim')
    max_clicks = models.PositiveIntegerField(null=True, blank=True, verbose_name='Maksimum Tıklama')
    daily_budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Günlük Bütçe (₺)')
    
    start_date = models.DateTimeField(verbose_name='Başlangıç Tarihi')
    end_date = models.DateTimeField(verbose_name='Bitiş Tarihi')
    
    # Hedefleme
    target_countries = models.JSONField(default=list, blank=True, verbose_name='Hedef Ülkeler')
    target_cities = models.JSONField(default=list, blank=True, verbose_name='Hedef Şehirler')
    target_devices = models.JSONField(default=list, blank=True, verbose_name='Hedef Cihazlar')
    target_categories = models.ManyToManyField('categories.Category', blank=True, verbose_name='Hedef Kategoriler')
    
    # İstatistikler
    total_impressions = models.PositiveIntegerField(default=0, verbose_name='Toplam Gösterim')
    total_clicks = models.PositiveIntegerField(default=0, verbose_name='Toplam Tıklama')
    total_conversions = models.PositiveIntegerField(default=0, verbose_name='Toplam Dönüşüm')
    
    notes = models.TextField(blank=True, verbose_name='Notlar')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Kampanya'
        verbose_name_plural = 'Kampanyalar'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'start_date', 'end_date']),
            models.Index(fields=['advertiser', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.advertiser.name}"
    
    @property
    def is_active(self):
        """Kampanyanın şu anda aktif olup olmadığını kontrol et"""
        now = timezone.now()
        return (
            self.status == 'active' and
            self.start_date <= now <= self.end_date and
            (not self.budget or self.spent < self.budget) and
            (not self.max_impressions or self.total_impressions < self.max_impressions) and
            (not self.max_clicks or self.total_clicks < self.max_clicks)
        )
    
    @property
    def ctr(self):
        """Click-Through Rate (Tıklama Oranı)"""
        if self.total_impressions == 0:
            return 0
        return (self.total_clicks / self.total_impressions) * 100
    
    @property
    def conversion_rate(self):
        """Dönüşüm Oranı"""
        if self.total_clicks == 0:
            return 0
        return (self.total_conversions / self.total_clicks) * 100


class Advertisement(models.Model):
    """Reklamlar"""
    AD_TYPES = [
        ('image', 'Görsel Reklam'),
        ('html', 'HTML Reklam'),
        ('video', 'Video Reklam'),
        ('script', 'Script (AdSense vb.)'),
        ('native', 'Native Reklam'),
    ]
    
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='advertisements', verbose_name='Kampanya')
    zone = models.ForeignKey(AdvertisementZone, on_delete=models.PROTECT, related_name='advertisements', verbose_name='Reklam Bölgesi')
    
    name = models.CharField(max_length=200, verbose_name='Reklam Adı')
    ad_type = models.CharField(max_length=20, choices=AD_TYPES, verbose_name='Reklam Tipi')
    
    # İçerik alanları
    image = models.ImageField(upload_to='advertisements/', null=True, blank=True, verbose_name='Görsel')
    video_url = models.URLField(blank=True, verbose_name='Video URL')
    html_content = models.TextField(blank=True, verbose_name='HTML İçerik')
    script_code = models.TextField(blank=True, verbose_name='Script Kodu')
    
    # Native reklam için
    title = models.CharField(max_length=200, blank=True, verbose_name='Başlık')
    description = models.TextField(blank=True, verbose_name='Açıklama')
    thumbnail = models.ImageField(upload_to='advertisements/thumbnails/', null=True, blank=True, verbose_name='Küçük Resim')
    
    # Bağlantı
    target_url = models.URLField(verbose_name='Hedef URL')
    open_in_new_tab = models.BooleanField(default=True, verbose_name='Yeni Sekmede Aç')
    
    # Sıralama ve öncelik
    priority = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)], verbose_name='Öncelik (0-100)')
    weight = models.PositiveIntegerField(default=10, validators=[MinValueValidator(1)], verbose_name='Ağırlık')
    
    # İstatistikler
    impressions = models.PositiveIntegerField(default=0, verbose_name='Gösterim')
    clicks = models.PositiveIntegerField(default=0, verbose_name='Tıklama')
    conversions = models.PositiveIntegerField(default=0, verbose_name='Dönüşüm')
    
    is_active = models.BooleanField(default=True, verbose_name='Aktif')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Reklam'
        verbose_name_plural = 'Reklamlar'
        ordering = ['-priority', '-weight', '-created_at']
        indexes = [
            models.Index(fields=['zone', '-priority', '-weight']),
            models.Index(fields=['campaign', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.zone.name}"
    
    @property
    def ctr(self):
        """Click-Through Rate"""
        if self.impressions == 0:
            return 0
        return (self.clicks / self.impressions) * 100


class AdImpression(models.Model):
    """Reklam Gösterimleri (İzleme)"""
    advertisement = models.ForeignKey(Advertisement, on_delete=models.CASCADE, related_name='impression_records', verbose_name='Reklam')
    
    # Kullanıcı bilgileri
    user = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Kullanıcı')
    ip_address = models.GenericIPAddressField(verbose_name='IP Adresi')
    user_agent = models.CharField(max_length=500, blank=True, verbose_name='User Agent')
    
    # Konum bilgileri
    country = models.CharField(max_length=100, blank=True, verbose_name='Ülke')
    city = models.CharField(max_length=100, blank=True, verbose_name='Şehir')
    
    # Cihaz bilgileri
    device_type = models.CharField(max_length=20, blank=True, verbose_name='Cihaz Tipi')
    browser = models.CharField(max_length=100, blank=True, verbose_name='Tarayıcı')
    os = models.CharField(max_length=100, blank=True, verbose_name='İşletim Sistemi')
    
    # Sayfa bilgileri
    page_url = models.URLField(verbose_name='Sayfa URL')
    referrer = models.URLField(blank=True, verbose_name='Referrer')
    
    # İçerik hedefleme
    content_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Zaman bilgisi
    viewed_at = models.DateTimeField(auto_now_add=True, verbose_name='Görüntülenme Zamanı')
    
    class Meta:
        verbose_name = 'Reklam Gösterimi'
        verbose_name_plural = 'Reklam Gösterimleri'
        ordering = ['-viewed_at']
        indexes = [
            models.Index(fields=['advertisement', '-viewed_at']),
            models.Index(fields=['ip_address', 'advertisement', '-viewed_at']),
        ]
    
    def __str__(self):
        return f"{self.advertisement.name} - {self.viewed_at}"


class AdClick(models.Model):
    """Reklam Tıklamaları"""
    advertisement = models.ForeignKey(Advertisement, on_delete=models.CASCADE, related_name='click_records', verbose_name='Reklam')
    impression = models.ForeignKey(AdImpression, on_delete=models.SET_NULL, null=True, blank=True, related_name='clicks', verbose_name='Gösterim')
    
    # Kullanıcı bilgileri
    user = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Kullanıcı')
    ip_address = models.GenericIPAddressField(verbose_name='IP Adresi')
    user_agent = models.CharField(max_length=500, blank=True, verbose_name='User Agent')
    
    # Konum bilgileri
    country = models.CharField(max_length=100, blank=True, verbose_name='Ülke')
    city = models.CharField(max_length=100, blank=True, verbose_name='Şehir')
    
    # Cihaz bilgileri
    device_type = models.CharField(max_length=20, blank=True, verbose_name='Cihaz Tipi')
    
    # Sayfa bilgileri
    page_url = models.URLField(verbose_name='Sayfa URL')
    
    # İçerik hedefleme
    content_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Zaman bilgisi
    clicked_at = models.DateTimeField(auto_now_add=True, verbose_name='Tıklanma Zamanı')
    
    class Meta:
        verbose_name = 'Reklam Tıklaması'
        verbose_name_plural = 'Reklam Tıklamaları'
        ordering = ['-clicked_at']
        indexes = [
            models.Index(fields=['advertisement', '-clicked_at']),
            models.Index(fields=['ip_address', 'advertisement', '-clicked_at']),
        ]
    
    def __str__(self):
        return f"{self.advertisement.name} - {self.clicked_at}"


class AdConversion(models.Model):
    """Reklam Dönüşümleri"""
    CONVERSION_TYPES = [
        ('registration', 'Kayıt'),
        ('subscription', 'Abonelik'),
        ('purchase', 'Satın Alma'),
        ('lead', 'Lead/İlgi'),
        ('download', 'İndirme'),
        ('custom', 'Özel'),
    ]
    
    advertisement = models.ForeignKey(Advertisement, on_delete=models.CASCADE, related_name='conversion_records', verbose_name='Reklam')
    click = models.ForeignKey(AdClick, on_delete=models.SET_NULL, null=True, blank=True, related_name='conversions', verbose_name='Tıklama')
    
    conversion_type = models.CharField(max_length=20, choices=CONVERSION_TYPES, verbose_name='Dönüşüm Tipi')
    conversion_value = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Dönüşüm Değeri (₺)')
    
    user = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Kullanıcı')
    ip_address = models.GenericIPAddressField(verbose_name='IP Adresi')
    
    notes = models.TextField(blank=True, verbose_name='Notlar')
    converted_at = models.DateTimeField(auto_now_add=True, verbose_name='Dönüşüm Zamanı')
    
    class Meta:
        verbose_name = 'Reklam Dönüşümü'
        verbose_name_plural = 'Reklam Dönüşümleri'
        ordering = ['-converted_at']
        indexes = [
            models.Index(fields=['advertisement', '-converted_at']),
        ]
    
    def __str__(self):
        return f"{self.advertisement.name} - {self.get_conversion_type_display()}"


class AdBlockDetection(models.Model):
    """AdBlock Tespiti"""
    ip_address = models.GenericIPAddressField(verbose_name='IP Adresi')
    user = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Kullanıcı')
    user_agent = models.CharField(max_length=500, blank=True, verbose_name='User Agent')
    page_url = models.URLField(verbose_name='Sayfa URL')
    detected_at = models.DateTimeField(auto_now_add=True, verbose_name='Tespit Zamanı')
    
    class Meta:
        verbose_name = 'AdBlock Tespiti'
        verbose_name_plural = 'AdBlock Tespitleri'
        ordering = ['-detected_at']
