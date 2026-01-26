"""
Image Optimization Utility

WebP conversion, responsive image generation, lazy loading support.
"""
import io
import os
import base64
from PIL import Image, ImageFilter
from django.core.files.base import ContentFile
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


# Responsive breakpoints (width in pixels)
RESPONSIVE_SIZES = {
    'xs': 320,
    'sm': 640,
    'md': 768,
    'lg': 1024,
    'xl': 1280,
    '2xl': 1536,
}

# WebP quality settings
WEBP_QUALITY = getattr(settings, 'IMAGE_WEBP_QUALITY', 85)
JPEG_QUALITY = getattr(settings, 'IMAGE_JPEG_QUALITY', 85)
PNG_COMPRESSION = getattr(settings, 'IMAGE_PNG_COMPRESSION', 6)

# Placeholder settings
PLACEHOLDER_SIZE = getattr(settings, 'IMAGE_PLACEHOLDER_SIZE', 20)
PLACEHOLDER_BLUR = getattr(settings, 'IMAGE_PLACEHOLDER_BLUR', 10)


class ImageOptimizer:
    """
    Image optimization class for WebP conversion,
    responsive images, and lazy loading placeholders.
    """

    SUPPORTED_FORMATS = {'JPEG', 'JPG', 'PNG', 'GIF', 'BMP', 'TIFF', 'WEBP'}

    def __init__(self, image_file):
        """
        Initialize with an image file.

        Args:
            image_file: Django File/FieldFile or file path
        """
        self.original_file = image_file
        self._image = None
        self._format = None

    def _load_image(self):
        """Load image into PIL Image object."""
        if self._image is None:
            if hasattr(self.original_file, 'read'):
                self.original_file.seek(0)
                self._image = Image.open(self.original_file)
            else:
                self._image = Image.open(self.original_file)

            # Store original format
            self._format = self._image.format or 'JPEG'

            # Convert to RGB if necessary (for WebP conversion)
            if self._image.mode in ('RGBA', 'LA', 'P'):
                # Keep alpha for PNG/WebP
                if self._image.mode == 'P':
                    self._image = self._image.convert('RGBA')
            elif self._image.mode not in ('RGB', 'L'):
                self._image = self._image.convert('RGB')

        return self._image

    def is_supported(self):
        """Check if the image format is supported."""
        try:
            img = self._load_image()
            return img.format in self.SUPPORTED_FORMATS if img.format else True
        except Exception:
            return False

    def get_dimensions(self):
        """Get image dimensions."""
        img = self._load_image()
        return img.width, img.height

    def convert_to_webp(self, quality=None):
        """
        Convert image to WebP format.

        Args:
            quality: WebP quality (0-100), defaults to settings

        Returns:
            ContentFile with WebP image
        """
        if quality is None:
            quality = WEBP_QUALITY

        img = self._load_image()
        output = io.BytesIO()

        # Handle transparency
        if img.mode in ('RGBA', 'LA'):
            img.save(output, format='WEBP', quality=quality, lossless=False)
        else:
            # Convert to RGB for non-transparent images
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img.save(output, format='WEBP', quality=quality)

        output.seek(0)
        return ContentFile(output.read())

    def resize(self, width, height=None, maintain_aspect=True):
        """
        Resize image to specified dimensions.

        Args:
            width: Target width
            height: Target height (optional if maintain_aspect=True)
            maintain_aspect: Maintain aspect ratio

        Returns:
            PIL Image object
        """
        img = self._load_image().copy()

        if maintain_aspect:
            # Calculate height maintaining aspect ratio
            aspect = img.height / img.width
            if height is None:
                height = int(width * aspect)
            else:
                # Fit within both dimensions
                width_ratio = width / img.width
                height_ratio = height / img.height
                ratio = min(width_ratio, height_ratio)
                width = int(img.width * ratio)
                height = int(img.height * ratio)

        # Use high-quality resampling
        resized = img.resize((width, height), Image.Resampling.LANCZOS)
        return resized

    def generate_responsive_variant(self, target_width, format='original', quality=None):
        """
        Generate a responsive image variant.

        Args:
            target_width: Target width in pixels
            format: 'original', 'webp', or 'jpeg'
            quality: Image quality

        Returns:
            ContentFile with resized image
        """
        img = self._load_image()

        # Skip if original is smaller than target
        if img.width <= target_width:
            return None

        # Resize
        resized = self.resize(target_width)
        output = io.BytesIO()

        if format == 'webp':
            quality = quality or WEBP_QUALITY
            if resized.mode in ('RGBA', 'LA'):
                resized.save(output, format='WEBP', quality=quality)
            else:
                if resized.mode != 'RGB':
                    resized = resized.convert('RGB')
                resized.save(output, format='WEBP', quality=quality)
        elif format == 'jpeg':
            quality = quality or JPEG_QUALITY
            if resized.mode != 'RGB':
                resized = resized.convert('RGB')
            resized.save(output, format='JPEG', quality=quality, optimize=True)
        else:
            # Keep original format
            save_format = self._format if self._format != 'WEBP' else 'PNG'
            if save_format == 'JPEG':
                if resized.mode != 'RGB':
                    resized = resized.convert('RGB')
                resized.save(output, format='JPEG', quality=quality or JPEG_QUALITY, optimize=True)
            elif save_format == 'PNG':
                resized.save(output, format='PNG', compress_level=PNG_COMPRESSION)
            else:
                resized.save(output, format=save_format)

        output.seek(0)
        return ContentFile(output.read())

    def generate_all_responsive_variants(self):
        """
        Generate all responsive variants.

        Returns:
            dict with variant name -> ContentFile mappings
        """
        variants = {}
        img = self._load_image()

        for name, width in RESPONSIVE_SIZES.items():
            # Skip if original is smaller
            if img.width <= width:
                continue

            # Generate original format variant
            original_variant = self.generate_responsive_variant(width, format='original')
            if original_variant:
                variants[f'image_{name}'] = original_variant

            # Generate WebP variant
            webp_variant = self.generate_responsive_variant(width, format='webp')
            if webp_variant:
                variants[f'webp_{name}'] = webp_variant

        return variants

    def generate_placeholder(self, size=None, blur=None):
        """
        Generate a tiny blurred placeholder for lazy loading.

        Args:
            size: Placeholder size (width in pixels)
            blur: Blur radius

        Returns:
            Base64 encoded placeholder string
        """
        size = size or PLACEHOLDER_SIZE
        blur = blur or PLACEHOLDER_BLUR

        img = self._load_image()

        # Calculate proportional height
        aspect = img.height / img.width
        height = int(size * aspect)

        # Resize to tiny size
        tiny = img.resize((size, height), Image.Resampling.LANCZOS)

        # Apply blur
        blurred = tiny.filter(ImageFilter.GaussianBlur(radius=blur))

        # Convert to base64
        output = io.BytesIO()
        if blurred.mode in ('RGBA', 'LA'):
            blurred.save(output, format='PNG')
            mime_type = 'image/png'
        else:
            if blurred.mode != 'RGB':
                blurred = blurred.convert('RGB')
            blurred.save(output, format='JPEG', quality=20)
            mime_type = 'image/jpeg'

        output.seek(0)
        b64 = base64.b64encode(output.read()).decode('utf-8')
        return f'data:{mime_type};base64,{b64}'

    def get_dominant_color(self):
        """
        Get the dominant color of the image.

        Returns:
            Hex color string (e.g., '#FF5733')
        """
        img = self._load_image()

        # Resize to small size for faster processing
        small = img.resize((50, 50), Image.Resampling.LANCZOS)

        # Convert to RGB
        if small.mode != 'RGB':
            small = small.convert('RGB')

        # Get colors
        pixels = list(small.getdata())

        # Calculate average color
        r = sum(p[0] for p in pixels) // len(pixels)
        g = sum(p[1] for p in pixels) // len(pixels)
        b = sum(p[2] for p in pixels) // len(pixels)

        return f'#{r:02x}{g:02x}{b:02x}'

    def generate_thumbnail(self, size=(300, 300), crop=True):
        """
        Generate a thumbnail.

        Args:
            size: Tuple of (width, height)
            crop: Whether to crop to exact dimensions

        Returns:
            ContentFile with thumbnail
        """
        img = self._load_image().copy()

        if crop:
            # Crop to aspect ratio then resize
            img.thumbnail(size, Image.Resampling.LANCZOS)
        else:
            # Just resize maintaining aspect
            img.thumbnail(size, Image.Resampling.LANCZOS)

        output = io.BytesIO()
        if img.mode in ('RGBA', 'LA'):
            img.save(output, format='PNG')
        else:
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img.save(output, format='JPEG', quality=JPEG_QUALITY)

        output.seek(0)
        return ContentFile(output.read())

    def generate_webp_thumbnail(self, size=(300, 300)):
        """
        Generate a WebP thumbnail.

        Args:
            size: Tuple of (width, height)

        Returns:
            ContentFile with WebP thumbnail
        """
        img = self._load_image().copy()
        img.thumbnail(size, Image.Resampling.LANCZOS)

        output = io.BytesIO()
        if img.mode in ('RGBA', 'LA'):
            img.save(output, format='WEBP', quality=WEBP_QUALITY)
        else:
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img.save(output, format='WEBP', quality=WEBP_QUALITY)

        output.seek(0)
        return ContentFile(output.read())


def process_media_image(media_instance):
    """
    Process a Media instance to generate all optimized versions.

    Args:
        media_instance: Media model instance

    Returns:
        bool: Success status
    """
    from apps.media_app.models import Media

    if media_instance.file_type != 'image':
        return False

    try:
        optimizer = ImageOptimizer(media_instance.file)

        if not optimizer.is_supported():
            logger.warning(f"Unsupported image format for Media {media_instance.id}")
            return False

        # Get original filename without extension
        original_name = os.path.splitext(os.path.basename(media_instance.file.name))[0]

        # Generate WebP version
        webp_content = optimizer.convert_to_webp()
        media_instance.webp_file.save(f'{original_name}.webp', webp_content, save=False)

        # Generate thumbnail
        thumbnail_content = optimizer.generate_thumbnail()
        media_instance.thumbnail.save(f'{original_name}_thumb.jpg', thumbnail_content, save=False)

        # Generate WebP thumbnail
        webp_thumb_content = optimizer.generate_webp_thumbnail()
        media_instance.webp_thumbnail.save(f'{original_name}_thumb.webp', webp_thumb_content, save=False)

        # Generate responsive variants
        variants = optimizer.generate_all_responsive_variants()
        for field_name, content in variants.items():
            field = getattr(media_instance, field_name)
            ext = '.webp' if field_name.startswith('webp_') else '.jpg'
            field.save(f'{original_name}_{field_name}{ext}', content, save=False)

        # Generate placeholder
        media_instance.placeholder = optimizer.generate_placeholder()

        # Get dominant color
        media_instance.dominant_color = optimizer.get_dominant_color()

        # Get dimensions
        width, height = optimizer.get_dimensions()
        media_instance.width = width
        media_instance.height = height

        # Mark as completed
        media_instance.processing_status = 'completed'
        media_instance.save()

        logger.info(f"Successfully processed Media {media_instance.id}")
        return True

    except Exception as e:
        logger.error(f"Error processing Media {media_instance.id}: {str(e)}")
        media_instance.processing_status = 'failed'
        media_instance.save()
        return False


def generate_blurhash(image_file):
    """
    Generate BlurHash for an image.

    Requires: pip install blurhash-python

    Args:
        image_file: Image file object

    Returns:
        BlurHash string
    """
    try:
        import blurhash
        img = Image.open(image_file)
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Resize for faster hashing
        img.thumbnail((100, 100), Image.Resampling.LANCZOS)

        return blurhash.encode(img, x_components=4, y_components=3)
    except ImportError:
        logger.warning("blurhash-python not installed. Skipping blurhash generation.")
        return ''
    except Exception as e:
        logger.error(f"Error generating blurhash: {str(e)}")
        return ''
