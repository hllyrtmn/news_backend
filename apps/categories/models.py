from django.db import models
from utils.helpers import generate_unique_slug


class Category(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Kategori Adı'
    )
    slug = models.SlugField(
        max_length=100,
        unique=True,
        verbose_name='Slug'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Açıklama'
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        verbose_name='Üst Kategori'
    )
    icon = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='İkon',
        help_text='FontAwesome icon class'
    )
    color_code = models.CharField(
        max_length=7,
        blank=True,
        verbose_name='Renk Kodu',
        help_text='Hex color code, örn: #FF5733'
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name='Sıra'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Aktif'
    )
    
    # SEO Fields
    meta_title = models.CharField(
        max_length=70,
        blank=True,
        verbose_name='Meta Title'
    )
    meta_description = models.CharField(
        max_length=160,
        blank=True,
        verbose_name='Meta Description'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Kategori'
        verbose_name_plural = 'Kategoriler'
        ordering = ['order', 'name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['parent', 'order']),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(Category, self.name, self)
        super().save(*args, **kwargs)
    
    @property
    def article_count(self):
        return self.articles.filter(status='published').count()
    
    def get_all_children(self):
        """Get all descendant categories"""
        children = list(self.children.all())
        for child in self.children.all():
            children.extend(child.get_all_children())
        return children
