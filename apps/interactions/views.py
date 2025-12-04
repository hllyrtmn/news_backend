from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Like, Share
from .serializers import LikeSerializer, ShareSerializer
from apps.articles.models import Article


class LikeViewSet(viewsets.ModelViewSet):
    """Beğeni işlemleri"""
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Like.objects.filter(user=self.request.user).select_related('article')
        return Like.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def toggle(self, request):
        """Beğeni durumunu değiştir (like/unlike)"""
        article_id = request.data.get('article_id')
        if not article_id:
            return Response({'error': 'article_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        article = get_object_or_404(Article, id=article_id)
        like, created = Like.objects.get_or_create(user=request.user, article=article)
        
        if not created:
            like.delete()
            return Response({'status': 'unliked'}, status=status.HTTP_200_OK)
        
        return Response({'status': 'liked'}, status=status.HTTP_201_CREATED)


class ShareViewSet(viewsets.ModelViewSet):
    """Paylaşım işlemleri"""
    serializer_class = ShareSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Share.objects.all()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        article_id = self.request.query_params.get('article')
        if article_id:
            queryset = queryset.filter(article_id=article_id)
        return queryset
    
    def perform_create(self, serializer):
        # IP adresini al
        ip_address = self.request.META.get('HTTP_X_FORWARDED_FOR', self.request.META.get('REMOTE_ADDR', ''))
        if ip_address:
            ip_address = ip_address.split(',')[0].strip()
        
        serializer.save(
            user=self.request.user if self.request.user.is_authenticated else None,
            ip_address=ip_address
        )


# Bookmark ve ReadHistory ViewSets artık apps.bookmarks.views içinde