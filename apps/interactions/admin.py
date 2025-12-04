from django.contrib import admin
from .models import Like, Share


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'article', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'article__title']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'


@admin.register(Share)
class ShareAdmin(admin.ModelAdmin):
    list_display = ['article', 'platform', 'user', 'created_at']
    list_filter = ['platform', 'created_at']
    search_fields = ['article__title', 'user__email']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'


# Bookmark ve ReadHistory admin artık apps.bookmarks.admin içinde