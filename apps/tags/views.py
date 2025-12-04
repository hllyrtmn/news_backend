from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.core.cache import cache
from drf_spectacular.utils import extend_schema
from utils.permissions import IsAdminOrReadOnly
from .models import Tag
from .serializers import TagSerializer, TagMinimalSerializer


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAdminOrReadOnly]
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TagMinimalSerializer
        return TagSerializer
    
    @extend_schema(summary="Etiket Listesi")
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(summary="Etiket Detayı")
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    @extend_schema(summary="Popüler Etiketler")
    def trending(self, request):
        cache_key = 'tags:trending'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        trending_tags = Tag.objects.all()[:20]
        serializer = TagMinimalSerializer(trending_tags, many=True)
        
        cache.set(cache_key, serializer.data, 900)  # 15 minutes
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    @extend_schema(summary="Etiketin Makaleleri")
    def articles(self, request, slug=None):
        tag = self.get_object()
        from apps.articles.models import Article
        from apps.articles.serializers import ArticleListSerializer
        from utils.pagination import ArticlePagination
        
        articles = Article.objects.filter(
            tags=tag,
            status='published'
        ).select_related('category', 'author').prefetch_related('tags').order_by('-published_at')
        
        paginator = ArticlePagination()
        page = paginator.paginate_queryset(articles, request)
        
        if page is not None:
            serializer = ArticleListSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = ArticleListSerializer(articles, many=True)
        return Response(serializer.data)
