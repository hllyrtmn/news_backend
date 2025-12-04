"""
Core views for the news application.
"""

from rest_framework import viewsets, generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import connection
from django.core.cache import cache
from utils.helpers import get_client_ip
from .models import SiteSettings, ContactMessage, Report
from .serializers import SiteSettingsSerializer, ContactMessageSerializer, ReportSerializer
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint for monitoring.
    Returns the status of the application and its dependencies.
    """
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        db_status = "unhealthy"
    
    try:
        # Check cache connection
        cache.set('health_check', 'ok', 10)
        cache_status = "healthy"
    except Exception as e:
        logger.error(f"Cache health check failed: {str(e)}")
        cache_status = "unhealthy"
    
    # Determine overall status
    overall_status = "healthy" if db_status == "healthy" and cache_status == "healthy" else "unhealthy"
    
    response_data = {
        'status': overall_status,
        'database': db_status,
        'cache': cache_status,
    }
    
    status_code = status.HTTP_200_OK if overall_status == "healthy" else status.HTTP_503_SERVICE_UNAVAILABLE
    
    return Response(response_data, status=status_code)


@api_view(['GET'])
def api_info(request):
    """
    API information endpoint.
    """
    return Response({
        'name': 'News Backend API',
        'version': '1.0.0',
        'description': 'Kapsamlı Haber Sitesi REST API',
        'endpoints': {
            'articles': '/api/v1/articles/',
            'categories': '/api/v1/categories/',
            'tags': '/api/v1/tags/',
            'comments': '/api/v1/comments/',
            'interactions': '/api/v1/interactions/',
            'analytics': '/api/v1/analytics/',
            'newsletter': '/api/v1/newsletter/',
            'auth': '/api/v1/auth/',
        },
        'documentation': {
            'swagger': '/api/docs/',
            'redoc': '/api/redoc/',
            'schema': '/api/schema/',
        }
    })


@api_view(['GET'])
def site_settings(request):
    """Get site settings."""
    settings = SiteSettings.objects.first()
    if not settings:
        settings = SiteSettings.objects.create()
    serializer = SiteSettingsSerializer(settings)
    return Response(serializer.data)


class ContactMessageCreateView(generics.CreateAPIView):
    """Create a contact message."""
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        serializer.save(ip_address=get_client_ip(self.request))


class ReportCreateView(generics.CreateAPIView):
    """Create a report for inappropriate content."""
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    
    def perform_create(self, serializer):
        serializer.save(
            reported_by=self.request.user if self.request.user.is_authenticated else None
        )
