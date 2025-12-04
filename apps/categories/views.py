from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.core.cache import cache
from django.conf import settings
from drf_spectacular.utils import extend_schema
from utils.permissions import IsAdminOrReadOnly
from utils.cache_utils import CacheManager
from .models import Category
from .serializers import (
    CategorySerializer,
    CategoryMinimalSerializer,
    CategoryTreeSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Category CRUD operations
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAdminOrReadOnly]
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CategoryMinimalSerializer
        elif self.action == 'tree':
            return CategoryTreeSerializer
        return CategorySerializer
    
    @extend_schema(
        summary="Kategori Listesi",
        description="Tüm kategorileri listeler",
    )
    def list(self, request, *args, **kwargs):
        # Try cache first
        cache_key = 'categories:list'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Cache for 30 minutes
        cache.set(cache_key, serializer.data, settings.CACHE_TTL.get('CATEGORY_LIST', 1800))
        
        return Response(serializer.data)
    
    @extend_schema(
        summary="Kategori Detayı",
        description="Belirli bir kategorinin detaylarını döndürür",
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    @extend_schema(
        summary="Kategori Ağacı",
        description="Kategorileri hiyerarşik yapıda döndürür",
    )
    def tree(self, request):
        """Get categories in hierarchical tree structure"""
        cache_key = 'categories:tree'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Get only root categories
        root_categories = Category.objects.filter(
            parent=None,
            is_active=True
        ).order_by('order', 'name')
        
        serializer = self.get_serializer(root_categories, many=True)
        
        # Cache for 30 minutes
        cache.set(cache_key, serializer.data, 1800)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    @extend_schema(
        summary="Kategorinin Makaleleri",
        description="Belirli bir kategorideki tüm makaleleri döndürür",
    )
    def articles(self, request, slug=None):
        """Get all articles in this category"""
        category = self.get_object()
        
        from apps.articles.models import Article
        from apps.articles.serializers import ArticleListSerializer
        from utils.pagination import ArticlePagination
        
        articles = Article.objects.filter(
            category=category,
            status='published'
        ).select_related('category', 'author').prefetch_related('tags').order_by('-published_at')
        
        paginator = ArticlePagination()
        page = paginator.paginate_queryset(articles, request)
        
        if page is not None:
            serializer = ArticleListSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = ArticleListSerializer(articles, many=True)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        serializer.save()
        # Invalidate cache
        cache.delete('categories:list')
        cache.delete('categories:tree')
    
    def perform_update(self, serializer):
        serializer.save()
        # Invalidate cache
        cache.delete('categories:list')
        cache.delete('categories:tree')
        CacheManager.invalidate_category(serializer.instance.slug)
    
    def perform_destroy(self, instance):
        slug = instance.slug
        instance.delete()
        # Invalidate cache
        cache.delete('categories:list')
        cache.delete('categories:tree')
        CacheManager.invalidate_category(slug)
