from rest_framework import serializers
from .models import BookmarkFolder, Bookmark, ReadingHistory, ReadingList, ReadingListItem
from apps.articles.serializers import ArticleListSerializer


class BookmarkFolderSerializer(serializers.ModelSerializer):
    bookmarks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BookmarkFolder
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_bookmarks_count(self, obj):
        return obj.bookmarks.count()


class BookmarkSerializer(serializers.ModelSerializer):
    article_data = ArticleListSerializer(source='article', read_only=True)
    folder_name = serializers.CharField(source='folder.name', read_only=True)
    
    class Meta:
        model = Bookmark
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class BookmarkCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = ['article', 'folder', 'note', 'tags', 'reminder_date']


class ReadingHistorySerializer(serializers.ModelSerializer):
    article_data = ArticleListSerializer(source='article', read_only=True)
    
    class Meta:
        model = ReadingHistory
        fields = '__all__'
        read_only_fields = ['user', 'read_at']


class ReadingListItemSerializer(serializers.ModelSerializer):
    article_data = ArticleListSerializer(source='article', read_only=True)
    
    class Meta:
        model = ReadingListItem
        fields = '__all__'


class ReadingListSerializer(serializers.ModelSerializer):
    items = ReadingListItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ReadingList
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_items_count(self, obj):
        return obj.items.count()
