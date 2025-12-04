from django.urls import path
from .views import (
    site_settings,
    health_check,
    api_info,
    ContactMessageCreateView,
    ReportCreateView
)

urlpatterns = [
    # Health and info endpoints
    path('health/', health_check, name='health-check'),
    path('info/', api_info, name='api-info'),
    
    # Settings and contact
    path('settings/', site_settings, name='site-settings'),
    path('contact/', ContactMessageCreateView.as_view(), name='contact'),
    path('report/', ReportCreateView.as_view(), name='report'),
]
