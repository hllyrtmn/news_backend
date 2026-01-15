from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from ckeditor.fields import RichTextField
from utils.helpers import generate_unique_slug, calculate_read_time

User = get_user_model()

class Article(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Taslak'),
        ('pending', 'Onay Bekliyor'),
        ('published', 'Yayınlandı'),
        ('archived', 'Arşiv'),
    ]
    
    VISIBILITY_CHOICES = [
        ('public', 'Herkese Açık'),
        ('premium', 'Premium Üyeler'),
        ('subscriber_only', 'Sadece Aboneler'),
    ]

    ARTICLE_TYPE_CHOICES = [
        ('news', 'Haber'),
        ('column', 'Köşe Yazısı'),
        ('analysis', 'Analiz'),
        ('interview', 'Röportaj'),
        ('report', 'Özel Rapor'),
        ('opinion', 'Yorum'),
    ]

    title = models.CharField(max_length=255, verbose_name='Başlık')
    slug = models.SlugField(max_length=255, unique=True, verbose_name='Slug')
    subtitle = models.CharField(max_length=255, blank=True, verbose_name='Alt Başlık')
    summary = models.TextField(max_length=500, verbose_name='Özet')
    content = RichTextField(verbose_name='İçerik')
    
    author = models.ForeignKey('accounts.AuthorProfile', on_delete=models.PROTECT, related_name='articles', verbose_name='Yazar')
    co_authors = models.ManyToManyField('accounts.AuthorProfile', related_name='co_authored_articles', blank=True, verbose_name='Ortak Yazarlar')
    category = models.ForeignKey('categories.Category', on_delete=models.PROTECT, related_name='articles', verbose_name='Kategori')
    tags = models.ManyToManyField('tags.Tag', related_name='articles', blank=True, verbose_name='Etiketler')
    featured_image = models.ForeignKey('media_app.Media', on_delete=models.SET_NULL, null=True, blank=True, related_name='featured_in_articles', verbose_name='Öne Çıkan Görsel')
    gallery = models.ManyToManyField('media_app.Media', related_name='article_galleries', blank=True, verbose_name='Galeri')
    
    # Video desteği
    has_video = models.BooleanField(default=False, verbose_name='Video İçeriyor')
    video_url = models.URLField(blank=True, verbose_name='Video URL (YouTube, Vimeo, vb.)')
    video_file = models.FileField(upload_to='videos/', null=True, blank=True, verbose_name='Video Dosyası')
    video_thumbnail = models.ImageField(upload_to='video_thumbnails/', null=True, blank=True, verbose_name='Video Küçük Resmi')
    video_duration = models.PositiveIntegerField(default=0, verbose_name='Video Süresi (saniye)')
    video_embed_code = models.TextField(blank=True, verbose_name='Video Embed Kodu')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='Durum')
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='public', verbose_name='Görünürlük')
    article_type = models.CharField(max_length=20, choices=ARTICLE_TYPE_CHOICES, default='news', verbose_name='Makale Tipi', db_index=True)

    is_featured = models.BooleanField(default=False, verbose_name='Manşet')
    is_breaking = models.BooleanField(default=False, verbose_name='Son Dakika')
    is_trending = models.BooleanField(default=False, verbose_name='Gündemde')
    
    views_count = models.PositiveIntegerField(default=0, verbose_name='Görüntülenme')
    read_time = models.PositiveIntegerField(default=0, verbose_name='Okuma Süresi (dk)')
    
    published_at = models.DateTimeField(null=True, blank=True, verbose_name='Yayın Tarihi')
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name='Son Geçerlilik')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Oluşturulma')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Güncellenme')
    
    meta_title = models.CharField(max_length=70, blank=True, verbose_name='Meta Title')
    meta_description = models.CharField(max_length=160, blank=True, verbose_name='Meta Description')
    meta_keywords = models.CharField(max_length=255, blank=True, verbose_name='Meta Keywords')
    og_image = models.ImageField(upload_to='og_images/', null=True, blank=True, verbose_name='OG Image')
    
    class Meta:
        verbose_name = 'Haber'
        verbose_name_plural = 'Haberler'
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['-published_at']),
            models.Index(fields=['status']),
            models.Index(fields=['is_breaking']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['is_trending']),
            models.Index(fields=['-views_count']),
        ]
    
    def __str__(self):
        return self.title
    
    def increment_views(self):
        """Görüntülenme sayısını artır"""
        self.views_count += 1
        self.save(update_fields=['views_count'])
        
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(Article, self.title, self)
        if self.content:
            self.read_time = calculate_read_time(self.content)
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

class ArticleRevision(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='revisions')
    title = models.CharField(max_length=255)
    content = RichTextField()
    revised_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    revision_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

class RelatedArticle(models.Model):
    RELATION_TYPES = [('similar', 'Benzer'), ('continuation', 'Devamı'), ('background', 'Arka Plan')]
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='related_from')
    related_article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='related_to')
    relation_type = models.CharField(max_length=20, choices=RELATION_TYPES, default='similar')
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        unique_together = ['article', 'related_article']
