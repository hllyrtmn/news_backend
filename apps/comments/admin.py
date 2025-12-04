from django.contrib import admin
from .models import Comment, CommentLike

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('content_short', 'user', 'article', 'status', 'created_at')
    list_filter = ('status', 'is_pinned', 'created_at')
    search_fields = ('content', 'user__username', 'email', 'name')
    actions = ['approve_comments', 'reject_comments']
    
    def content_short(self, obj):
        return obj.content[:50]
    
    def approve_comments(self, request, queryset):
        queryset.update(status='approved')
    
    def reject_comments(self, request, queryset):
        queryset.update(status='rejected')

@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ('comment', 'user', 'is_like', 'created_at')
