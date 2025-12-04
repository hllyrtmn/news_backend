from django.contrib import admin
from .models import BookmarkFolder, Bookmark, ReadingHistory, ReadingList, ReadingListItem


@admin.register(BookmarkFolder)
class BookmarkFolderAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'color', 'order', 'is_default', 'created_at']
    list_filter = ['is_default', 'created_at']
    search_fields = ['user__email', 'name']
    ordering = ['user', 'order']


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ['user', 'article', 'folder', 'is_favorite', 'is_read', 'created_at']
    list_filter = ['is_favorite', 'is_read', 'created_at']
    search_fields = ['user__email', 'article__title']
    ordering = ['-created_at']


@admin.register(ReadingHistory)
class ReadingHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'article', 'read_percentage', 'time_spent', 'is_completed', 'read_at']
    list_filter = ['is_completed', 'device_type', 'read_at']
    search_fields = ['user__email', 'article__title']
    ordering = ['-read_at']


@admin.register(ReadingList)
class ReadingListAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'is_public', 'is_default', 'created_at']
    list_filter = ['is_public', 'is_default', 'created_at']
    search_fields = ['user__email', 'name']
    ordering = ['-created_at']


@admin.register(ReadingListItem)
class ReadingListItemAdmin(admin.ModelAdmin):
    list_display = ['reading_list', 'article', 'order', 'is_read', 'added_at']
    list_filter = ['is_read', 'added_at']
    search_fields = ['reading_list__name', 'article__title']
    ordering = ['reading_list', 'order']
