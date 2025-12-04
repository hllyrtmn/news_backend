from django.contrib import admin
from .models import ArticleView, PopularArticle, SocialShare

@admin.register(ArticleView)
class ArticleViewAdmin(admin.ModelAdmin):
    list_display = ('article', 'user', 'device_type', 'country', 'viewed_at')
    list_filter = ('device_type', 'country', 'viewed_at')
    readonly_fields = ('viewed_at',)

@admin.register(PopularArticle)
class PopularArticleAdmin(admin.ModelAdmin):
    list_display = ('article', 'period', 'score', 'views_count', 'date')
    list_filter = ('period', 'date')

@admin.register(SocialShare)
class SocialShareAdmin(admin.ModelAdmin):
    list_display = ('article', 'platform', 'share_count', 'last_updated')
    list_filter = ('platform',)
