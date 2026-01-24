from django.contrib import admin
from .models import Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['recipient__username', 'sender__username', 'title', 'message']
    readonly_fields = ['created_at', 'read_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Genel Bilgiler', {
            'fields': ('recipient', 'sender', 'notification_type')
        }),
        ('İçerik', {
            'fields': ('title', 'message', 'link')
        }),
        ('İlişkili Obje', {
            'fields': ('content_type', 'object_id'),
            'classes': ('collapse',)
        }),
        ('Durum', {
            'fields': ('is_read', 'created_at', 'read_at')
        }),
    )


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_on_comment', 'push_on_comment', 'inapp_on_comment']
    search_fields = ['user__username', 'user__email']

    fieldsets = (
        ('Kullanıcı', {
            'fields': ('user',)
        }),
        ('Email Bildirimleri', {
            'fields': (
                'email_on_comment', 'email_on_reply', 'email_on_like',
                'email_on_follow', 'email_on_mention'
            )
        }),
        ('Push Bildirimleri', {
            'fields': (
                'push_on_comment', 'push_on_reply', 'push_on_like',
                'push_on_follow', 'push_on_mention'
            )
        }),
        ('In-App Bildirimleri', {
            'fields': (
                'inapp_on_comment', 'inapp_on_reply', 'inapp_on_like',
                'inapp_on_follow', 'inapp_on_mention'
            )
        }),
    )
