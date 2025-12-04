from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.db.models import Q, F
from django.utils import timezone
from django.core.cache import cache
from django.conf import settings
from drf_spectacular.utils import extend_schema
from utils.permissions import IsAuthorOrReadOnly, IsAuthorEditorOrAdmin
from utils.pagination import ArticlePagination
from utils.cache_utils import CacheManager
from utils.helpers import get_client_ip
from .models import Article
from .serializers import ArticleListSerializer, ArticleDetailSerializer, ArticleCreateUpdateSerializer
from .filters import ArticleFilter

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.select_related('author', 'author__user', 'category').prefetch_related('tags', 'co_authors')
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    pagination_class = ArticlePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ArticleFilter
    search_fields = ['title', 'subtitle', 'summary', 'content']
    ordering_fields = ['published_at', 'views_count', 'created_at']
    ordering = ['-published_at']
    lookup_field = 'slug'
    
    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(status='published', published_at__lte=timezone.now())
        return qs
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ArticleListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ArticleCreateUpdateSerializer
        return ArticleDetailSerializer
    
    @extend_schema(summary="Haber Listesi", description="Yayınlanmış haberleri listeler")
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    @extend_schema(summary="Haber Arama", description="Haber arar")
    def search(self, request):
        """
        Haber arama
        
        GET /articles/search/?q=python
        
        Query Parameters:
        - q: Arama sorgusu
        
        Returns: List of matching articles
        """
        query = request.query_params.get('q', '')
        
        if not query:
            return Response({'results': []})
        
        articles = Article.objects.filter(
            Q(title__icontains=query) |
            Q(summary__icontains=query) |
            Q(content__icontains=query),
            status='published'
        ).select_related(
            'author',
            'category'
        ).prefetch_related(
            'tags'
        ).order_by('-published_at')[:20]
        
        serializer = self.get_serializer(articles, many=True)
        return Response({'results': serializer.data})
    
    @extend_schema(summary="Haber Detayı", description="Belirli bir haberin detaylarını döndürür")
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # IP Adresini Al
        ip_address = get_client_ip(request)
        
        # Analitik Modeli ve Zaman Araçlarını İçe Aktar
        from apps.analytics.models import ArticleView
        from django.utils import timezone
        from datetime import timedelta
        
        # Son 24 saat kontrolü (Süreyi isteğinize göre değiştirebilirsiniz)
        time_threshold = timezone.now() - timedelta(hours=24)
        
        # Bu IP adresi bu haberi son 24 saatte görmüş mü?
        has_viewed = ArticleView.objects.filter(
            article=instance,
            ip_address=ip_address,
            viewed_at__gte=time_threshold
        ).exists()
        
        if not has_viewed:
            # Görüntülenme sayısını artır (Sadece yeni izlenmeyse)
            instance.increment_views()
            
            # Analitik kaydı oluştur
            ArticleView.objects.create(
                article=instance,
                user=request.user if request.user.is_authenticated else None,
                ip_address=ip_address,
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:255]
            )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def view(self, request, slug=None):
        """
        Haber görüntülenme kaydı
        
        POST /articles/{slug}/view/
        
        Returns: Updated article with view count
        """
        article = self.get_object()
        article.views_count += 1
        article.save(update_fields=['views_count'])
        
        serializer = self.get_serializer(article)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    @extend_schema(summary="Öne Çıkan Haberler")
    def featured(self, request):
        """
        Öne çıkan haberler
        
        GET /articles/featured/
        
        Returns: List of featured articles
        """
        featured_articles = Article.objects.filter(
            status='published',
            is_featured=True
        ).select_related(
            'author',
            'category'
        ).prefetch_related(
            'tags'
        ).order_by('-published_at')[:5]
        
        serializer = self.get_serializer(featured_articles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    @extend_schema(summary="Son Dakika Haberleri")
    def breaking(self, request):
        """
        Son dakika haberleri
        
        GET /articles/breaking/
        
        Returns: List of breaking articles
        """
        breaking_articles = Article.objects.filter(
            status='published',
            is_breaking=True
        ).select_related(
            'author',
            'category'
        ).prefetch_related(
            'tags'
        ).order_by('-published_at')[:10]
        
        serializer = self.get_serializer(breaking_articles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    @extend_schema(summary="Popüler Haberler")
    def popular(self, request):
        """
        Popüler haberler
        
        GET /articles/popular/?period=weekly
        
        Query Parameters:
        - period: daily, weekly, monthly (default: weekly)
        
        Returns: List of popular articles
        """
        period = request.query_params.get('period', 'weekly')
        
        # Period'a göre filtrele
        if period == 'daily':
            from datetime import timedelta
            from django.utils import timezone
            start_date = timezone.now() - timedelta(days=1)
        elif period == 'monthly':
            from datetime import timedelta
            from django.utils import timezone
            start_date = timezone.now() - timedelta(days=30)
        else:  # weekly (default)
            from datetime import timedelta
            from django.utils import timezone
            start_date = timezone.now() - timedelta(days=7)
        
        popular_articles = Article.objects.filter(
            status='published',
            published_at__gte=start_date
        ).select_related(
            'author',
            'category'
        ).prefetch_related(
            'tags'
        ).order_by('-views_count')[:20]
        
        serializer = self.get_serializer(popular_articles, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    @extend_schema(summary="Trend Haberler")
    def trending(self, request):
        """
        Trending haberler
        
        GET /articles/trending/
        
        Returns: List of trending articles
        """
        trending_articles = Article.objects.filter(
            status='published',
            is_trending=True
        ).select_related(
            'author',
            'category'
        ).prefetch_related(
            'tags'
        ).order_by('-views_count')[:10]
        
        serializer = self.get_serializer(trending_articles, many=True)
        return Response(serializer.data)

