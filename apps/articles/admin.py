from django.contrib import admin
from .models import Article, ArticleRevision, RelatedArticle

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'status', 'is_featured', 'views_count', 'published_at')
    list_filter = ('status', 'is_featured', 'is_breaking', 'category', 'created_at')
    search_fields = ('title', 'subtitle', 'summary', 'content')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('tags', 'co_authors', 'gallery')
    date_hierarchy = 'published_at'
    readonly_fields = ('views_count', 'read_time', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Temel Bilgiler', {'fields': ('title', 'slug', 'subtitle', 'summary')}),
        ('İçerik', {'fields': ('content',)}),
        ('İlişkiler', {'fields': ('author', 'co_authors', 'category', 'tags')}),
        ('Medya', {'fields': ('featured_image', 'gallery')}),
        ('Durum', {'fields': ('status', 'visibility', 'is_featured', 'is_breaking', 'is_trending')}),
        ('İstatistikler', {'fields': ('views_count', 'read_time')}),
        ('Tarihler', {'fields': ('published_at', 'expires_at', 'created_at', 'updated_at')}),
        ('SEO', {'fields': ('meta_title', 'meta_description', 'meta_keywords', 'og_image'), 'classes': ('collapse',)}),
    )

@admin.register(ArticleRevision)
class ArticleRevisionAdmin(admin.ModelAdmin):
    list_display = ('article', 'revised_by', 'created_at')
    list_filter = ('created_at',)
    readonly_fields = ('created_at',)

@admin.register(RelatedArticle)
class RelatedArticleAdmin(admin.ModelAdmin):
    list_display = ('article', 'related_article', 'relation_type', 'order')
    list_filter = ('relation_type',)

print("Admin created")
