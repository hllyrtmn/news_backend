from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
import os

User = get_user_model()


class Media(models.Model):
    FILE_TYPES = [
        ('image', 'Görsel'),
        ('video', 'Video'),
        ('audio', 'Ses'),
        ('document', 'Doküman'),
    ]

    PROCESSING_STATUS = [
        ('pending', 'Bekliyor'),
        ('processing', 'İşleniyor'),
        ('completed', 'Tamamlandı'),
        ('failed', 'Başarısız'),
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

    # Image Optimization Fields
    processing_status = models.CharField(
        max_length=20,
        choices=PROCESSING_STATUS,
        default='pending',
        verbose_name='İşlem Durumu'
    )

    # WebP Versions
    webp_file = models.FileField(
        upload_to='media/webp/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='WebP Versiyonu'
    )
    webp_thumbnail = models.ImageField(
        upload_to='thumbnails/webp/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='WebP Thumbnail'
    )

    # Responsive Image Variants (srcset)
    image_xs = models.ImageField(
        upload_to='media/responsive/xs/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='Extra Small (320px)'
    )
    image_sm = models.ImageField(
        upload_to='media/responsive/sm/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='Small (640px)'
    )
    image_md = models.ImageField(
        upload_to='media/responsive/md/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='Medium (768px)'
    )
    image_lg = models.ImageField(
        upload_to='media/responsive/lg/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='Large (1024px)'
    )
    image_xl = models.ImageField(
        upload_to='media/responsive/xl/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='Extra Large (1280px)'
    )
    image_2xl = models.ImageField(
        upload_to='media/responsive/2xl/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='2X Large (1536px)'
    )

    # WebP Responsive Variants
    webp_xs = models.FileField(
        upload_to='media/responsive/webp/xs/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='WebP Extra Small (320px)'
    )
    webp_sm = models.FileField(
        upload_to='media/responsive/webp/sm/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='WebP Small (640px)'
    )
    webp_md = models.FileField(
        upload_to='media/responsive/webp/md/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='WebP Medium (768px)'
    )
    webp_lg = models.FileField(
        upload_to='media/responsive/webp/lg/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='WebP Large (1024px)'
    )
    webp_xl = models.FileField(
        upload_to='media/responsive/webp/xl/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='WebP Extra Large (1280px)'
    )
    webp_2xl = models.FileField(
        upload_to='media/responsive/webp/2xl/%Y/%m/',
        null=True,
        blank=True,
        verbose_name='WebP 2X Large (1536px)'
    )

    # Lazy loading placeholder (blurred low-res version)
    placeholder = models.TextField(
        blank=True,
        verbose_name='Base64 Placeholder',
        help_text='Low-res blurred placeholder for lazy loading (base64)'
    )

    # Dominant color for placeholder background
    dominant_color = models.CharField(
        max_length=7,
        blank=True,
        verbose_name='Dominant Renk',
        help_text='Hex color code (e.g., #FF5733)'
    )

    # Blurhash for modern lazy loading
    blurhash = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='BlurHash',
        help_text='BlurHash string for placeholder'
    )

    class Meta:
        verbose_name = 'Medya'
        verbose_name_plural = 'Medya Dosyaları'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def is_image(self):
        return self.file_type == 'image'

    @property
    def is_optimized(self):
        return self.processing_status == 'completed'

    @property
    def srcset(self):
        """Generate srcset string for responsive images"""
        if not self.is_image:
            return ''

        srcset_parts = []
        sizes = [
            (self.image_xs, 320),
            (self.image_sm, 640),
            (self.image_md, 768),
            (self.image_lg, 1024),
            (self.image_xl, 1280),
            (self.image_2xl, 1536),
        ]

        for image_field, width in sizes:
            if image_field:
                srcset_parts.append(f'{image_field.url} {width}w')

        return ', '.join(srcset_parts)

    @property
    def srcset_webp(self):
        """Generate srcset string for WebP responsive images"""
        if not self.is_image:
            return ''

        srcset_parts = []
        sizes = [
            (self.webp_xs, 320),
            (self.webp_sm, 640),
            (self.webp_md, 768),
            (self.webp_lg, 1024),
            (self.webp_xl, 1280),
            (self.webp_2xl, 1536),
        ]

        for image_field, width in sizes:
            if image_field:
                srcset_parts.append(f'{image_field.url} {width}w')

        return ', '.join(srcset_parts)

    @property
    def sizes_attribute(self):
        """Default sizes attribute for responsive images"""
        return '(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, (max-width: 1280px) 1280px, 1536px'

    def get_optimal_url(self, width=None, prefer_webp=True):
        """Get the optimal image URL based on requested width and format support"""
        if not self.is_image:
            return self.file.url if self.file else None

        if prefer_webp and self.webp_file:
            if width:
                webp_sizes = [
                    (320, self.webp_xs),
                    (640, self.webp_sm),
                    (768, self.webp_md),
                    (1024, self.webp_lg),
                    (1280, self.webp_xl),
                    (1536, self.webp_2xl),
                ]
                for size, field in webp_sizes:
                    if field and width <= size:
                        return field.url
            return self.webp_file.url

        if width:
            sizes = [
                (320, self.image_xs),
                (640, self.image_sm),
                (768, self.image_md),
                (1024, self.image_lg),
                (1280, self.image_xl),
                (1536, self.image_2xl),
            ]
            for size, field in sizes:
                if field and width <= size:
                    return field.url

        return self.file.url if self.file else None
