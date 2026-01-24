from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from utils.helpers import generate_unique_slug


class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = [
        ('admin', 'Yönetici'),
        ('editor', 'Editör'),
        ('author', 'Yazar'),
        ('subscriber', 'Abone'),
        ('reader', 'Okuyucu'),
    ]
    
    email = models.EmailField(_('email address'), unique=True)
    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES,
        default='reader',
        verbose_name='Kullanıcı Tipi'
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        verbose_name='Avatar'
    )
    bio = models.TextField(
        max_length=500,
        blank=True,
        verbose_name='Biyografi'
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='Telefon'
    )
    birth_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Doğum Tarihi'
    )
    is_verified = models.BooleanField(
        default=False,
        verbose_name='Email Doğrulandı'
    )

    # Two-Factor Authentication
    two_factor_enabled = models.BooleanField(
        default=False,
        verbose_name='İki Faktörlü Kimlik Doğrulama Aktif'
    )
    totp_secret = models.CharField(
        max_length=32,
        blank=True,
        verbose_name='TOTP Secret Key'
    )
    backup_codes = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Yedek Kodlar'
    )

    class Meta:
        verbose_name = 'Kullanıcı'
        verbose_name_plural = 'Kullanıcılar'
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.username
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username


class AuthorProfile(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='author_profile',
        verbose_name='Kullanıcı'
    )
    display_name = models.CharField(
        max_length=100,
        verbose_name='Görünen Ad'
    )
    slug = models.SlugField(
        max_length=100,
        unique=True,
        verbose_name='Slug'
    )
    title = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Ünvan',
        help_text='Örn: Kıdemli Muhabir'
    )
    specialty = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Uzmanlık Alanı',
        help_text='Örn: Spor Muhabirliği'
    )
    bio_long = models.TextField(
        blank=True,
        verbose_name='Detaylı Biyografi'
    )
    
    # Social Media
    social_twitter = models.URLField(blank=True, verbose_name='Twitter')
    social_linkedin = models.URLField(blank=True, verbose_name='LinkedIn')
    social_instagram = models.URLField(blank=True, verbose_name='Instagram')
    social_facebook = models.URLField(blank=True, verbose_name='Facebook')
    website = models.URLField(blank=True, verbose_name='Website')
    
    # Statistics
    total_articles = models.PositiveIntegerField(
        default=0,
        verbose_name='Toplam Haber Sayısı'
    )
    total_views = models.PositiveIntegerField(
        default=0,
        verbose_name='Toplam Görüntülenme'
    )
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        verbose_name='Ortalama Puan'
    )
    
    is_featured = models.BooleanField(
        default=False,
        verbose_name='Öne Çıkan Yazar'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Yazar Profili'
        verbose_name_plural = 'Yazar Profilleri'
        ordering = ['-total_articles']
    
    def __str__(self):
        return self.display_name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(
                AuthorProfile,
                self.display_name,
                self
            )
        super().save(*args, **kwargs)


class UserPreference(models.Model):
    LANGUAGE_CHOICES = [
        ('tr', 'Türkçe'),
        ('en', 'English'),
    ]
    
    THEME_CHOICES = [
        ('light', 'Açık'),
        ('dark', 'Koyu'),
        ('auto', 'Otomatik'),
    ]
    
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='preferences',
        verbose_name='Kullanıcı'
    )
    
    # Notification Settings
    email_notifications = models.BooleanField(
        default=True,
        verbose_name='Email Bildirimleri'
    )
    push_notifications = models.BooleanField(
        default=True,
        verbose_name='Push Bildirimleri'
    )
    newsletter_subscribed = models.BooleanField(
        default=False,
        verbose_name='Newsletter Aboneliği'
    )
    
    # Display Settings
    language = models.CharField(
        max_length=2,
        choices=LANGUAGE_CHOICES,
        default='tr',
        verbose_name='Dil'
    )
    theme = models.CharField(
        max_length=10,
        choices=THEME_CHOICES,
        default='light',
        verbose_name='Tema'
    )
    font_size = models.CharField(
        max_length=10,
        default='medium',
        verbose_name='Font Boyutu'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Kullanıcı Tercihi'
        verbose_name_plural = 'Kullanıcı Tercihleri'
    
    def __str__(self):
        return f"{self.user.username} Tercihleri"


class UserPreferredCategory(models.Model):
    """
    User's preferred categories for personalized content
    """
    preference = models.ForeignKey(
        UserPreference,
        on_delete=models.CASCADE,
        related_name='preferred_categories'
    )
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.CASCADE
    )
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Tercih Edilen Kategori'
        verbose_name_plural = 'Tercih Edilen Kategoriler'
        ordering = ['order']
        unique_together = ['preference', 'category']
