from rest_framework import serializers
from .models import Media


class ResponsiveImageSerializer(serializers.Serializer):
    """Serializer for responsive image data."""
    srcset = serializers.CharField(read_only=True)
    srcset_webp = serializers.CharField(read_only=True)
    sizes = serializers.CharField(read_only=True)
    placeholder = serializers.CharField(read_only=True)
    dominant_color = serializers.CharField(read_only=True)
    blurhash = serializers.CharField(read_only=True)


class MediaSerializer(serializers.ModelSerializer):
    """Full media serializer with all optimization fields."""
    srcset = serializers.SerializerMethodField()
    srcset_webp = serializers.SerializerMethodField()
    sizes = serializers.SerializerMethodField()
    is_optimized = serializers.BooleanField(read_only=True)
    is_image = serializers.BooleanField(read_only=True)

    # Responsive image URLs
    responsive_urls = serializers.SerializerMethodField()
    webp_responsive_urls = serializers.SerializerMethodField()

    class Meta:
        model = Media
        fields = [
            'id', 'title', 'alt_text', 'caption',
            'file', 'file_type', 'mime_type', 'file_size',
            'width', 'height', 'duration',
            'thumbnail', 'webp_file', 'webp_thumbnail',
            'uploaded_by', 'copyright_holder', 'is_featured',
            'created_at', 'processing_status',
            # Optimization fields
            'is_optimized', 'is_image',
            'srcset', 'srcset_webp', 'sizes',
            'placeholder', 'dominant_color', 'blurhash',
            'responsive_urls', 'webp_responsive_urls',
        ]
        read_only_fields = (
            'uploaded_by', 'created_at', 'file_size', 'mime_type',
            'width', 'height', 'processing_status',
            'webp_file', 'webp_thumbnail', 'thumbnail',
            'placeholder', 'dominant_color', 'blurhash',
        )

    def get_srcset(self, obj):
        """Get srcset attribute for responsive images."""
        if not obj.is_image:
            return None
        return obj.srcset or None

    def get_srcset_webp(self, obj):
        """Get WebP srcset attribute."""
        if not obj.is_image:
            return None
        return obj.srcset_webp or None

    def get_sizes(self, obj):
        """Get sizes attribute."""
        if not obj.is_image:
            return None
        return obj.sizes_attribute

    def get_responsive_urls(self, obj):
        """Get all responsive image URLs."""
        if not obj.is_image:
            return None

        urls = {}
        for size in ['xs', 'sm', 'md', 'lg', 'xl', '2xl']:
            field = getattr(obj, f'image_{size}', None)
            if field:
                urls[size] = field.url
        return urls if urls else None

    def get_webp_responsive_urls(self, obj):
        """Get all WebP responsive image URLs."""
        if not obj.is_image:
            return None

        urls = {}
        for size in ['xs', 'sm', 'md', 'lg', 'xl', '2xl']:
            field = getattr(obj, f'webp_{size}', None)
            if field:
                urls[size] = field.url
        return urls if urls else None


class MediaListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for media listings."""
    is_optimized = serializers.BooleanField(read_only=True)
    thumbnail_url = serializers.SerializerMethodField()
    webp_thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Media
        fields = [
            'id', 'title', 'alt_text', 'file', 'file_type',
            'thumbnail_url', 'webp_thumbnail_url',
            'width', 'height', 'is_featured', 'is_optimized',
            'dominant_color', 'created_at',
        ]

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            return obj.thumbnail.url
        return None

    def get_webp_thumbnail_url(self, obj):
        if obj.webp_thumbnail:
            return obj.webp_thumbnail.url
        return None


class MediaUploadSerializer(serializers.ModelSerializer):
    """Serializer for media uploads."""

    class Meta:
        model = Media
        fields = ('file', 'title', 'alt_text', 'caption', 'file_type', 'copyright_holder')

    def validate_file(self, value):
        """Validate uploaded file."""
        from django.conf import settings

        # Check file size
        max_size = getattr(settings, 'MAX_UPLOAD_SIZE', 10 * 1024 * 1024)
        if value.size > max_size:
            raise serializers.ValidationError(
                f"Dosya boyutu çok büyük. Maksimum: {max_size // (1024 * 1024)}MB"
            )

        return value


class MediaOptimizedSerializer(serializers.ModelSerializer):
    """
    Serializer optimized for frontend lazy loading.

    Returns minimal data needed for initial render with lazy loading support.
    """
    src = serializers.SerializerMethodField()
    webp_src = serializers.SerializerMethodField()
    srcset = serializers.SerializerMethodField()
    srcset_webp = serializers.SerializerMethodField()
    sizes = serializers.CharField(source='sizes_attribute', read_only=True)

    class Meta:
        model = Media
        fields = [
            'id', 'alt_text', 'width', 'height',
            'src', 'webp_src', 'srcset', 'srcset_webp', 'sizes',
            'placeholder', 'dominant_color', 'blurhash',
        ]

    def get_src(self, obj):
        """Get original image source."""
        if obj.file:
            return obj.file.url
        return None

    def get_webp_src(self, obj):
        """Get WebP image source."""
        if obj.webp_file:
            return obj.webp_file.url
        return None

    def get_srcset(self, obj):
        """Get srcset for responsive images."""
        return obj.srcset or None

    def get_srcset_webp(self, obj):
        """Get WebP srcset."""
        return obj.srcset_webp or None


class PictureElementSerializer(serializers.ModelSerializer):
    """
    Serializer that returns data formatted for HTML <picture> element.

    Example output:
    {
        "sources": [
            {"srcset": "...", "type": "image/webp", "sizes": "..."},
            {"srcset": "...", "type": "image/jpeg", "sizes": "..."}
        ],
        "img": {
            "src": "...",
            "alt": "...",
            "width": 1200,
            "height": 800,
            "loading": "lazy",
            "decoding": "async",
            "style": "background-color: #f5f5f5"
        }
    }
    """
    sources = serializers.SerializerMethodField()
    img = serializers.SerializerMethodField()

    class Meta:
        model = Media
        fields = ['sources', 'img']

    def get_sources(self, obj):
        """Generate source elements for picture tag."""
        sources = []

        # WebP source (preferred)
        if obj.srcset_webp:
            sources.append({
                'srcset': obj.srcset_webp,
                'type': 'image/webp',
                'sizes': obj.sizes_attribute,
            })

        # Original format source (fallback)
        if obj.srcset:
            mime_type = obj.mime_type or 'image/jpeg'
            sources.append({
                'srcset': obj.srcset,
                'type': mime_type,
                'sizes': obj.sizes_attribute,
            })

        return sources

    def get_img(self, obj):
        """Generate img element attributes."""
        return {
            'src': obj.file.url if obj.file else None,
            'alt': obj.alt_text or obj.title,
            'width': obj.width,
            'height': obj.height,
            'loading': 'lazy',
            'decoding': 'async',
            'style': f'background-color: {obj.dominant_color}' if obj.dominant_color else None,
            'data-placeholder': obj.placeholder if obj.placeholder else None,
            'data-blurhash': obj.blurhash if obj.blurhash else None,
        }
