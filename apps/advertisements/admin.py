from django.contrib import admin
from django.utils.html import format_html
from .models import (
    AdvertisementZone, Advertiser, Campaign, Advertisement,
    AdImpression, AdClick, AdConversion, AdBlockDetection
)


@admin.register(AdvertisementZone)
class AdvertisementZoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'zone_type', 'width', 'height', 'is_active', 'created_at']
    list_filter = ['zone_type', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['zone_type', 'name']


@admin.register(Advertiser)
class AdvertiserAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'contact_person', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'email', 'contact_person']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']


class AdvertisementInline(admin.TabularInline):
    model = Advertisement
    extra = 0
    fields = ['name', 'zone', 'ad_type', 'priority', 'is_active']
    readonly_fields = []


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'advertiser', 'status', 'pricing_model', 'budget', 
        'spent', 'total_impressions', 'total_clicks', 'ctr_display', 
        'start_date', 'end_date'
    ]
    list_filter = ['status', 'pricing_model', 'start_date', 'end_date']
    search_fields = ['name', 'advertiser__name']
    ordering = ['-created_at']
    readonly_fields = ['total_impressions', 'total_clicks', 'total_conversions', 'spent', 'created_at', 'updated_at']
    inlines = [AdvertisementInline]
    
    fieldsets = (
        ('Temel Bilgiler', {
            'fields': ('name', 'advertiser', 'status', 'notes')
        }),
        ('Fiyatlandırma', {
            'fields': ('pricing_model', 'budget', 'spent', 'cpm_price', 'cpc_price', 'cpa_price', 'daily_budget')
        }),
        ('Limitler', {
            'fields': ('max_impressions', 'max_clicks')
        }),
        ('Tarihler', {
            'fields': ('start_date', 'end_date')
        }),
        ('Hedefleme', {
            'fields': ('target_countries', 'target_cities', 'target_devices', 'target_categories'),
            'classes': ('collapse',)
        }),
        ('İstatistikler', {
            'fields': ('total_impressions', 'total_clicks', 'total_conversions'),
            'classes': ('collapse',)
        }),
    )
    
    def ctr_display(self, obj):
        return f"{obj.ctr:.2f}%"
    ctr_display.short_description = 'CTR'


@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'campaign', 'zone', 'ad_type', 'preview', 
        'priority', 'impressions', 'clicks', 'ctr_display', 'is_active'
    ]
    list_filter = ['ad_type', 'is_active', 'zone', 'campaign__status']
    search_fields = ['name', 'campaign__name']
    ordering = ['-priority', '-created_at']
    readonly_fields = ['impressions', 'clicks', 'conversions', 'created_at', 'updated_at', 'preview']
    
    fieldsets = (
        ('Temel Bilgiler', {
            'fields': ('campaign', 'zone', 'name', 'ad_type', 'is_active')
        }),
        ('İçerik', {
            'fields': ('image', 'video_url', 'html_content', 'script_code', 'title', 'description', 'thumbnail')
        }),
        ('Bağlantı', {
            'fields': ('target_url', 'open_in_new_tab')
        }),
        ('Öncelik ve Ağırlık', {
            'fields': ('priority', 'weight')
        }),
        ('İstatistikler', {
            'fields': ('impressions', 'clicks', 'conversions', 'preview'),
            'classes': ('collapse',)
        }),
    )
    
    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-width: 200px; max-height: 200px;" />', obj.image.url)
        elif obj.thumbnail:
            return format_html('<img src="{}" style="max-width: 200px; max-height: 200px;" />', obj.thumbnail.url)
        return "Görsel yok"
    preview.short_description = 'Önizleme'
    
    def ctr_display(self, obj):
        return f"{obj.ctr:.2f}%"
    ctr_display.short_description = 'CTR'


@admin.register(AdImpression)
class AdImpressionAdmin(admin.ModelAdmin):
    list_display = ['advertisement', 'user', 'ip_address', 'device_type', 'country', 'city', 'viewed_at']
    list_filter = ['device_type', 'country', 'viewed_at']
    search_fields = ['advertisement__name', 'ip_address', 'user__email']
    ordering = ['-viewed_at']
    readonly_fields = ['viewed_at']
    date_hierarchy = 'viewed_at'


@admin.register(AdClick)
class AdClickAdmin(admin.ModelAdmin):
    list_display = ['advertisement', 'user', 'ip_address', 'device_type', 'country', 'city', 'clicked_at']
    list_filter = ['device_type', 'country', 'clicked_at']
    search_fields = ['advertisement__name', 'ip_address', 'user__email']
    ordering = ['-clicked_at']
    readonly_fields = ['clicked_at']
    date_hierarchy = 'clicked_at'


@admin.register(AdConversion)
class AdConversionAdmin(admin.ModelAdmin):
    list_display = ['advertisement', 'conversion_type', 'conversion_value', 'user', 'ip_address', 'converted_at']
    list_filter = ['conversion_type', 'converted_at']
    search_fields = ['advertisement__name', 'user__email', 'ip_address']
    ordering = ['-converted_at']
    readonly_fields = ['converted_at']
    date_hierarchy = 'converted_at'


@admin.register(AdBlockDetection)
class AdBlockDetectionAdmin(admin.ModelAdmin):
    list_display = ['ip_address', 'user', 'page_url', 'detected_at']
    list_filter = ['detected_at']
    search_fields = ['ip_address', 'user__email', 'page_url']
    ordering = ['-detected_at']
    readonly_fields = ['detected_at']
    date_hierarchy = 'detected_at'
