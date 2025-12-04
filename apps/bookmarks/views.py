from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import BookmarkFolder, Bookmark, ReadingHistory, ReadingList, ReadingListItem
from .serializers import (
    BookmarkFolderSerializer, BookmarkSerializer, BookmarkCreateSerializer,
    ReadingHistorySerializer, ReadingListSerializer, ReadingListItemSerializer
)


class BookmarkFolderViewSet(viewsets.ModelViewSet):
    serializer_class = BookmarkFolderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return BookmarkFolder.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BookmarkViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BookmarkCreateSerializer
        return BookmarkSerializer
    
    def get_queryset(self):
        queryset = Bookmark.objects.filter(user=self.request.user).select_related('article', 'folder')
        
        folder_id = self.request.query_params.get('folder')
        if folder_id:
            queryset = queryset.filter(folder_id=folder_id)
        
        is_favorite = self.request.query_params.get('is_favorite')
        if is_favorite:
            queryset = queryset.filter(is_favorite=True)
        
        is_read = self.request.query_params.get('is_read')
        if is_read:
            queryset = queryset.filter(is_read=(is_read == 'true'))
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        bookmark = self.get_object()
        bookmark.is_favorite = not bookmark.is_favorite
        bookmark.save()
        return Response({'is_favorite': bookmark.is_favorite})
    
    @action(detail=True, methods=['post'])
    def toggle_read(self, request, pk=None):
        bookmark = self.get_object()
        bookmark.is_read = not bookmark.is_read
        bookmark.save()
        return Response({'is_read': bookmark.is_read})


class ReadingHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = ReadingHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ReadingHistory.objects.filter(user=self.request.user).select_related('article')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReadingListViewSet(viewsets.ModelViewSet):
    serializer_class = ReadingListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ReadingList.objects.filter(user=self.request.user).prefetch_related('items')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_article(self, request, pk=None):
        reading_list = self.get_object()
        article_id = request.data.get('article_id')
        
        if not article_id:
            return Response({'error': 'article_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        item, created = ReadingListItem.objects.get_or_create(
            reading_list=reading_list,
            article_id=article_id,
            defaults={'order': reading_list.items.count()}
        )
        
        if not created:
            return Response({'error': 'Article already in list'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(ReadingListItemSerializer(item).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def remove_article(self, request, pk=None):
        reading_list = self.get_object()
        article_id = request.data.get('article_id')
        
        if not article_id:
            return Response({'error': 'article_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        item = get_object_or_404(ReadingListItem, reading_list=reading_list, article_id=article_id)
        item.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
