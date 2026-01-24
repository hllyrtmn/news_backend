from django.urls import path
from .views import (
    site_settings,
    health_check,
    api_info,
    ContactMessageCreateView,
    ReportCreateView,
    global_search,
    search_autocomplete,
    search_suggestions,
)

urlpatterns = [
    # Health and info endpoints
    path('health/', health_check, name='health-check'),
    path('info/', api_info, name='api-info'),

    # Search endpoints
    path('search/', global_search, name='global-search'),
    path('search/autocomplete/', search_autocomplete, name='search-autocomplete'),
    path('search/suggestions/', search_suggestions, name='search-suggestions'),

    # Settings and contact
    path('settings/', site_settings, name='site-settings'),
    path('contact/', ContactMessageCreateView.as_view(), name='contact'),
    path('report/', ReportCreateView.as_view(), name='report'),
]
