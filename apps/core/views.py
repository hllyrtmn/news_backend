"""
Core views for the news application.
"""

from rest_framework import viewsets, generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import connection
from django.core.cache import cache
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from utils.helpers import get_client_ip
from .models import SiteSettings, ContactMessage, Report
from .serializers import SiteSettingsSerializer, ContactMessageSerializer, ReportSerializer
from .search import GlobalSearch, SearchSuggestions
from apps.articles.serializers import ArticleListSerializer
from apps.accounts.serializers import AuthorProfileMinimalSerializer
from apps.categories.serializers import CategorySerializer
from apps.tags.serializers import TagSerializer
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


# Search Views
@api_view(['GET'])
@cache_page(60 * 5)  # Cache for 5 minutes
def global_search(request):
    """
    Global search across all content types
    Query params:
        - q: search query (required)
        - type: filter by type (optional: articles, authors, categories, tags)
        - limit: results per type (default: 20)
    """
    query = request.GET.get('q', '').strip()
    search_type = request.GET.get('type', 'all')
    limit = int(request.GET.get('limit', 20))

    if not query:
        return Response({
            'error': 'Search query is required',
            'query': ''
        }, status=status.HTTP_400_BAD_REQUEST)

    if len(query) < 2:
        return Response({
            'error': 'Search query must be at least 2 characters',
            'query': query
        }, status=status.HTTP_400_BAD_REQUEST)

    # Search based on type
    if search_type == 'articles':
        try:
            results = GlobalSearch.search_articles(query, limit)
        except Exception:
            results = GlobalSearch.search_articles_simple(query, limit)

        serializer = ArticleListSerializer(results, many=True)
        return Response({
            'results': serializer.data,
            'count': results.count(),
            'query': query,
            'type': 'articles'
        })

    elif search_type == 'authors':
        results = GlobalSearch.search_authors(query, limit)
        serializer = AuthorProfileMinimalSerializer(results, many=True)
        return Response({
            'results': serializer.data,
            'count': results.count(),
            'query': query,
            'type': 'authors'
        })

    elif search_type == 'categories':
        results = GlobalSearch.search_categories(query, limit)
        serializer = CategorySerializer(results, many=True)
        return Response({
            'results': serializer.data,
            'count': results.count(),
            'query': query,
            'type': 'categories'
        })

    elif search_type == 'tags':
        results = GlobalSearch.search_tags(query, limit)
        serializer = TagSerializer(results, many=True)
        return Response({
            'results': serializer.data,
            'count': results.count(),
            'query': query,
            'type': 'tags'
        })

    else:  # search_type == 'all'
        results = GlobalSearch.search_all(
            query,
            article_limit=limit,
            author_limit=5,
            category_limit=5,
            tag_limit=5
        )

        return Response({
            'articles': ArticleListSerializer(results['articles'], many=True).data,
            'authors': AuthorProfileMinimalSerializer(results['authors'], many=True).data,
            'categories': CategorySerializer(results['categories'], many=True).data,
            'tags': TagSerializer(results['tags'], many=True).data,
            'total_count': results['total_count'],
            'query': query
        })


@api_view(['GET'])
def search_autocomplete(request):
    """
    Autocomplete suggestions for search
    Query params:
        - q: search query (required)
        - limit: number of suggestions (default: 10)
    """
    query = request.GET.get('q', '').strip()
    limit = int(request.GET.get('limit', 10))

    if not query or len(query) < 2:
        return Response({'suggestions': []})

    suggestions = GlobalSearch.autocomplete_mixed(query, limit)

    return Response({
        'suggestions': suggestions,
        'query': query
    })


@api_view(['GET'])
@cache_page(60 * 30)  # Cache for 30 minutes
def search_suggestions(request):
    """
    Get search suggestions (trending topics, popular searches)
    """
    trending_topics = SearchSuggestions.get_trending_topics(limit=10)
    popular_searches = SearchSuggestions.get_popular_searches(limit=10)

    return Response({
        'trending_topics': TagSerializer(trending_topics, many=True).data,
        'popular_searches': TagSerializer(popular_searches, many=True).data
    })
