from django.contrib import admin
from .models import Newsletter, NewsletterSubscription

@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ('name', 'frequency', 'is_active', 'created_at')
    list_filter = ('frequency', 'is_active')

@admin.register(NewsletterSubscription)
class NewsletterSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('email', 'newsletter', 'is_verified', 'is_active', 'subscribed_at')
    list_filter = ('is_verified', 'is_active', 'newsletter')
