from rest_framework import serializers
from .models import Like, Share


class LikeSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    article_title = serializers.CharField(source='article.title', read_only=True)
    
    class Meta:
        model = Like
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


class ShareSerializer(serializers.ModelSerializer):
    article_title = serializers.CharField(source='article.title', read_only=True)
    
    class Meta:
        model = Share
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


# Bookmark ve ReadHistory serializers artık apps.bookmarks.serializers içinde