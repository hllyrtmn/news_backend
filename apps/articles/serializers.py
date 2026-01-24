from rest_framework import serializers
from .models import Article, ArticleRevision, RelatedArticle
from apps.accounts.serializers import AuthorProfileMinimalSerializer
from apps.categories.serializers import CategoryMinimalSerializer
from apps.tags.serializers import TagMinimalSerializer
from .video_utils import VideoEmbedder, VideoValidator


class ArticleListSerializer(serializers.ModelSerializer):
    author = AuthorProfileMinimalSerializer(read_only=True)
    category = CategoryMinimalSerializer(read_only=True)
    tags = TagMinimalSerializer(many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'subtitle', 'summary',
            'category', 'author', 'tags',
            'featured_image', 'status', 'visibility', 'article_type',
            'is_featured', 'is_breaking', 'is_trending',
            'views_count', 'read_time', 'comment_count',
            'published_at', 'created_at', 'updated_at',
            'has_video', 'video_url', 'video_thumbnail',
        ]
        read_only_fields = ['id', 'slug', 'views_count', 'created_at', 'updated_at']
        
    def get_author(self, obj):
        if obj.author:
            return {
                'id': obj.author.id,
                'display_name': obj.author.display_name,
                'slug': obj.author.slug,
            }
        return None
    
    def get_category(self, obj):
        if obj.category:
            return {
                'id': obj.category.id,
                'name': obj.category.name,
                'slug': obj.category.slug,
            }
        return None
    
    def get_tags(self, obj):
        return [
            {
                'id': tag.id,
                'name': tag.name,
                'slug': tag.slug,
            }
            for tag in obj.tags.all()
        ]
        
    def get_comment_count(self, obj):
            # ESKİ (HATALI):
            # return obj.comments.filter(is_approved=True).count()
            
            # YENİ (DOĞRU):
            if hasattr(obj, 'comments'):
                return obj.comments.filter(status='approved').count()
            return 0


class ArticleDetailSerializer(serializers.ModelSerializer):
    author = AuthorProfileMinimalSerializer(read_only=True)
    co_authors = AuthorProfileMinimalSerializer(many=True, read_only=True)
    category = CategoryMinimalSerializer(read_only=True)
    tags = TagMinimalSerializer(many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()
    related_articles = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = '__all__'
        read_only_fields = ('slug', 'views_count', 'created_at', 'updated_at')
    
    def get_comment_count(self, obj):
        """Get approved comments count for the article."""
        if hasattr(obj, 'comments'):
            return obj.comments.filter(status='approved').count() 
        return 0
    
    def get_related_articles(self, obj):
        """Get related articles."""
        related = obj.related_from.select_related('related_article__author', 'related_article__category')[:5]
        return ArticleListSerializer([r.related_article for r in related], many=True).data


class ArticleCreateUpdateSerializer(serializers.ModelSerializer):
    video_url = serializers.URLField(required=False, allow_blank=True)
    video_file = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Article
        fields = (
            'title', 'subtitle', 'summary', 'content', 'author', 'co_authors',
            'category', 'tags', 'featured_image', 'gallery', 'status',
            'visibility', 'article_type', 'is_featured', 'is_breaking', 'published_at',
            'meta_title', 'meta_description', 'meta_keywords',
            'has_video', 'video_url', 'video_file', 'video_duration'
        )

    def validate_video_url(self, value):
        """Validate video URL (YouTube or Vimeo)"""
        if value:
            is_valid, message = VideoValidator.is_valid_video_url(value)
            if not is_valid:
                raise serializers.ValidationError(message)

        return value

    def validate_video_file(self, value):
        """Validate uploaded video file"""
        if value:
            is_valid, message = VideoValidator.is_valid_video_file(value)
            if not is_valid:
                raise serializers.ValidationError(message)

        return value

    def validate(self, data):
        """Validate that only one video source is provided"""
        video_url = data.get('video_url')
        video_file = data.get('video_file')

        if video_url and video_file:
            raise serializers.ValidationError(
                'Cannot provide both video_url and video_file. Choose one.'
            )

        return data

    def create(self, validated_data):
        """Process video metadata on create"""
        video_url = validated_data.get('video_url')

        if video_url:
            # Process video URL and generate embed code
            video_data = VideoEmbedder.process_video_url(video_url)
            if video_data:
                validated_data['video_embed_code'] = video_data['embed_code']
                validated_data['has_video'] = True

                # Auto-download thumbnail if not provided
                if not validated_data.get('video_thumbnail'):
                    # In production, download and save thumbnail
                    # For now, just store the URL
                    pass

        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Process video metadata on update"""
        video_url = validated_data.get('video_url')

        if video_url and video_url != instance.video_url:
            # Process new video URL
            video_data = VideoEmbedder.process_video_url(video_url)
            if video_data:
                validated_data['video_embed_code'] = video_data['embed_code']
                validated_data['has_video'] = True

        return super().update(instance, validated_data)
