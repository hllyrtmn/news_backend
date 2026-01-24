from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.sitemaps.views import sitemap
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

# SEO imports
from apps.seo.sitemaps import sitemaps
from apps.seo.feeds import LatestArticlesFeed, LatestArticlesAtomFeed, CategoryFeed, BreakingNewsFeed
from apps.seo.views import robots_txt, ads_txt

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # SEO
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('robots.txt', robots_txt),
    path('ads.txt', ads_txt),
    
    # RSS Feeds
    path('rss/', LatestArticlesFeed(), name='rss-feed'),
    path('atom/', LatestArticlesAtomFeed(), name='atom-feed'),
    path('rss/category/<slug:slug>/', CategoryFeed(), name='category-feed'),
    path('rss/breaking/', BreakingNewsFeed(), name='breaking-feed'),
    
    # API v1
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/articles/', include('apps.articles.urls')),
    path('api/v1/categories/', include('apps.categories.urls')),
    path('api/v1/tags/', include('apps.tags.urls')),
    path('api/v1/media/', include('apps.media_app.urls')),
    path('api/v1/comments/', include('apps.comments.urls')),
    path('api/v1/interactions/', include('apps.interactions.urls')),
    path('api/v1/newsletter/', include('apps.newsletter.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    path('api/v1/core/', include('apps.core.urls')),
    path('api/v1/advertisements/', include('apps.advertisements.urls')),  # Yeni: Reklam sistemi
    path('api/v1/bookmarks/', include('apps.bookmarks.urls')),  # Yeni: Bookmark sistemi
    path('api/v1/notifications/', include('apps.notifications.urls')),  # Yeni: Bildirim sistemi

    # CKEditor
    path('ckeditor/', include('ckeditor_uploader.urls')),
]

# Debug Toolbar
if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
        path('silk/', include('silk.urls', namespace='silk')),
    ]

# Static and Media files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Admin site customization
admin.site.site_header = "Haber Sitesi Yönetim Paneli"
admin.site.site_title = "Haber Sitesi Admin"
admin.site.index_title = "Yönetim Paneline Hoşgeldiniz"
