"""
Video utilities for articles
- YouTube/Vimeo URL parsing and embedding
- Video metadata extraction
- Video thumbnail generation
"""
import re
from urllib.parse import urlparse, parse_qs


class VideoEmbedder:
    """
    Parse video URLs and generate embed codes
    """

    @staticmethod
    def extract_youtube_id(url):
        """
        Extract YouTube video ID from various URL formats
        Supports:
        - https://www.youtube.com/watch?v=VIDEO_ID
        - https://youtu.be/VIDEO_ID
        - https://www.youtube.com/embed/VIDEO_ID
        """
        if not url:
            return None

        # youtu.be short format
        match = re.search(r'youtu\.be/([a-zA-Z0-9_-]+)', url)
        if match:
            return match.group(1)

        # youtube.com/watch format
        match = re.search(r'youtube\.com/watch\?v=([a-zA-Z0-9_-]+)', url)
        if match:
            return match.group(1)

        # youtube.com/embed format
        match = re.search(r'youtube\.com/embed/([a-zA-Z0-9_-]+)', url)
        if match:
            return match.group(1)

        return None

    @staticmethod
    def extract_vimeo_id(url):
        """
        Extract Vimeo video ID from URL
        Supports:
        - https://vimeo.com/VIDEO_ID
        - https://player.vimeo.com/video/VIDEO_ID
        """
        if not url:
            return None

        # vimeo.com format
        match = re.search(r'vimeo\.com/(\d+)', url)
        if match:
            return match.group(1)

        # player.vimeo.com format
        match = re.search(r'player\.vimeo\.com/video/(\d+)', url)
        if match:
            return match.group(1)

        return None

    @staticmethod
    def generate_youtube_embed(video_id, width=560, height=315, **params):
        """
        Generate YouTube iframe embed code
        Optional params: autoplay, mute, controls, etc.
        """
        if not video_id:
            return None

        # Default params
        default_params = {
            'modestbranding': 1,
            'rel': 0,
        }
        default_params.update(params)

        # Build query string
        param_str = '&'.join([f'{k}={v}' for k, v in default_params.items()])

        embed_code = f'''<iframe width="{width}" height="{height}"
src="https://www.youtube.com/embed/{video_id}?{param_str}"
frameborder="0"
allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
allowfullscreen></iframe>'''

        return embed_code.replace('\n', ' ').strip()

    @staticmethod
    def generate_vimeo_embed(video_id, width=640, height=360, **params):
        """
        Generate Vimeo iframe embed code
        """
        if not video_id:
            return None

        # Build query string
        param_str = '&'.join([f'{k}={v}' for k, v in params.items()])
        param_suffix = f'?{param_str}' if param_str else ''

        embed_code = f'''<iframe src="https://player.vimeo.com/video/{video_id}{param_suffix}"
width="{width}" height="{height}"
frameborder="0"
allow="autoplay; fullscreen; picture-in-picture"
allowfullscreen></iframe>'''

        return embed_code.replace('\n', ' ').strip()

    @staticmethod
    def get_youtube_thumbnail(video_id, quality='maxresdefault'):
        """
        Get YouTube thumbnail URL
        Quality options: maxresdefault, sddefault, hqdefault, mqdefault, default
        """
        if not video_id:
            return None

        return f'https://img.youtube.com/vi/{video_id}/{quality}.jpg'

    @staticmethod
    def get_vimeo_thumbnail(video_id):
        """
        Get Vimeo thumbnail URL
        Note: This requires an API call in production
        For now, return a placeholder
        """
        if not video_id:
            return None

        # In production, use Vimeo API:
        # https://vimeo.com/api/v2/video/VIDEO_ID.json
        return f'https://vumbnail.com/{video_id}.jpg'

    @staticmethod
    def detect_video_platform(url):
        """
        Detect video platform from URL
        Returns: 'youtube' | 'vimeo' | 'unknown'
        """
        if not url:
            return 'unknown'

        url_lower = url.lower()

        if 'youtube.com' in url_lower or 'youtu.be' in url_lower:
            return 'youtube'
        elif 'vimeo.com' in url_lower:
            return 'vimeo'
        else:
            return 'unknown'

    @staticmethod
    def process_video_url(url, width=560, height=315):
        """
        Process video URL and return embed code, thumbnail, and metadata
        Returns: dict with embed_code, thumbnail_url, platform, video_id
        """
        if not url:
            return None

        platform = VideoEmbedder.detect_video_platform(url)

        if platform == 'youtube':
            video_id = VideoEmbedder.extract_youtube_id(url)
            if not video_id:
                return None

            return {
                'platform': 'youtube',
                'video_id': video_id,
                'embed_code': VideoEmbedder.generate_youtube_embed(video_id, width, height),
                'thumbnail_url': VideoEmbedder.get_youtube_thumbnail(video_id),
                'watch_url': f'https://www.youtube.com/watch?v={video_id}'
            }

        elif platform == 'vimeo':
            video_id = VideoEmbedder.extract_vimeo_id(url)
            if not video_id:
                return None

            return {
                'platform': 'vimeo',
                'video_id': video_id,
                'embed_code': VideoEmbedder.generate_vimeo_embed(video_id, width, height),
                'thumbnail_url': VideoEmbedder.get_vimeo_thumbnail(video_id),
                'watch_url': f'https://vimeo.com/{video_id}'
            }

        return None


class VideoValidator:
    """
    Validate video files and URLs
    """

    # Allowed video formats
    ALLOWED_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov', 'avi']
    MAX_FILE_SIZE = 500 * 1024 * 1024  # 500 MB

    @staticmethod
    def is_valid_video_file(file):
        """
        Validate uploaded video file
        """
        if not file:
            return False, 'No file provided'

        # Check file size
        if file.size > VideoValidator.MAX_FILE_SIZE:
            return False, f'File size exceeds {VideoValidator.MAX_FILE_SIZE / (1024*1024)} MB'

        # Check file extension
        extension = file.name.split('.')[-1].lower()
        if extension not in VideoValidator.ALLOWED_EXTENSIONS:
            return False, f'Invalid file format. Allowed: {", ".join(VideoValidator.ALLOWED_EXTENSIONS)}'

        return True, 'Valid'

    @staticmethod
    def is_valid_video_url(url):
        """
        Validate video URL (YouTube or Vimeo)
        """
        if not url:
            return False, 'No URL provided'

        platform = VideoEmbedder.detect_video_platform(url)

        if platform == 'unknown':
            return False, 'Unsupported video platform. Only YouTube and Vimeo are supported'

        if platform == 'youtube':
            video_id = VideoEmbedder.extract_youtube_id(url)
            if not video_id:
                return False, 'Invalid YouTube URL'

        elif platform == 'vimeo':
            video_id = VideoEmbedder.extract_vimeo_id(url)
            if not video_id:
                return False, 'Invalid Vimeo URL'

        return True, 'Valid'


def get_video_duration(file_path):
    """
    Get video duration in seconds
    Requires: ffmpeg or moviepy
    """
    try:
        # Try using moviepy (install: pip install moviepy)
        from moviepy.editor import VideoFileClip

        clip = VideoFileClip(file_path)
        duration = int(clip.duration)
        clip.close()

        return duration
    except ImportError:
        # Fallback: use ffmpeg command
        import subprocess

        try:
            result = subprocess.run(
                ['ffprobe', '-v', 'error', '-show_entries',
                 'format=duration', '-of',
                 'default=noprint_wrappers=1:nokey=1', file_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT
            )
            duration = float(result.stdout)
            return int(duration)
        except Exception:
            return 0
    except Exception:
        return 0
