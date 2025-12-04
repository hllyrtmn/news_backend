from django.contrib import admin
from .models import Media

@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ('title', 'file_type', 'uploaded_by', 'file_size', 'created_at')
    list_filter = ('file_type', 'is_featured', 'created_at')
    search_fields = ('title', 'alt_text', 'caption')
    readonly_fields = ('file_size', 'mime_type', 'width', 'height', 'created_at')
