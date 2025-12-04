from django.contrib import admin
from .models import SiteSettings, ContactMessage, Report

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'is_read', 'replied', 'created_at')
    list_filter = ('is_read', 'replied', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('content_type', 'reason', 'status', 'created_at')
    list_filter = ('reason', 'status', 'created_at')
