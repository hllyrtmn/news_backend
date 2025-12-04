from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    article_count = serializers.ReadOnlyField()
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = (
            'id', 'name', 'slug', 'description', 'parent',
            'icon', 'color_code', 'order', 'is_active',
            'meta_title', 'meta_description', 'article_count',
            'children', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'slug', 'article_count', 'created_at', 'updated_at')
    
    def get_children(self, obj):
        if obj.children.exists():
            return CategoryMinimalSerializer(
                obj.children.filter(is_active=True),
                many=True
            ).data
        return []


class CategoryMinimalSerializer(serializers.ModelSerializer):
    """Minimal category info for lists"""
    article_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'icon', 'color_code', 'article_count')


class CategoryTreeSerializer(serializers.ModelSerializer):
    """Hierarchical category structure"""
    children = serializers.SerializerMethodField()
    article_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'icon', 'color_code', 'article_count', 'children')
    
    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return CategoryTreeSerializer(children, many=True).data
