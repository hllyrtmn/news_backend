from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, AuthorProfile, UserPreference, UserPreferredCategory


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'user_type', 'is_verified', 'is_active', 'date_joined')
    list_filter = ('user_type', 'is_verified', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Ek Bilgiler', {
            'fields': ('user_type', 'avatar', 'bio', 'phone', 'birth_date', 'is_verified')
        }),
    )


@admin.register(AuthorProfile)
class AuthorProfileAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'user', 'title', 'specialty', 'total_articles', 'is_featured')
    list_filter = ('is_featured', 'created_at')
    search_fields = ('display_name', 'user__username', 'specialty')
    prepopulated_fields = {'slug': ('display_name',)}
    readonly_fields = ('total_articles', 'total_views', 'average_rating', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Temel Bilgiler', {
            'fields': ('user', 'display_name', 'slug', 'title', 'specialty')
        }),
        ('Biyografi', {
            'fields': ('bio_long',)
        }),
        ('Sosyal Medya', {
            'fields': ('social_twitter', 'social_linkedin', 'social_instagram', 'social_facebook', 'website')
        }),
        ('İstatistikler', {
            'fields': ('total_articles', 'total_views', 'average_rating', 'is_featured')
        }),
        ('Tarihler', {
            'fields': ('created_at', 'updated_at')
        }),
    )


class UserPreferredCategoryInline(admin.TabularInline):
    model = UserPreferredCategory
    extra = 1


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'language', 'theme', 'email_notifications', 'newsletter_subscribed')
    list_filter = ('language', 'theme', 'email_notifications', 'newsletter_subscribed')
    search_fields = ('user__username', 'user__email')
    inlines = [UserPreferredCategoryInline]
