from django.core.cache import cache
from django.conf import settings
from functools import wraps
import hashlib
import json


def generate_cache_key(prefix, *args, **kwargs):
    """
    Generate a unique cache key based on prefix and arguments
    """
    key_data = f"{prefix}:{args}:{sorted(kwargs.items())}"
    key_hash = hashlib.md5(key_data.encode()).hexdigest()
    return f"news:{prefix}:{key_hash}"


def cache_response(timeout=None, key_prefix='view'):
    """
    Decorator to cache view responses
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            # Generate cache key from request
            cache_key = generate_cache_key(
                key_prefix,
                request.path,
                request.GET.dict(),
                request.user.id if request.user.is_authenticated else 'anon'
            )
            
            # Try to get from cache
            cached_response = cache.get(cache_key)
            if cached_response is not None:
                return cached_response
            
            # Call the actual function
            response = func(self, request, *args, **kwargs)
            
            # Cache the response
            cache_timeout = timeout or settings.CACHE_TTL.get('ARTICLE_LIST', 300)
            cache.set(cache_key, response, cache_timeout)
            
            return response
        return wrapper
    return decorator


def invalidate_cache_pattern(pattern):
    """
    Invalidate all cache keys matching a pattern
    """
    try:
        cache_keys = cache.keys(f"news:{pattern}:*")
        if cache_keys:
            cache.delete_many(cache_keys)
    except Exception as e:
        # Some cache backends don't support keys() method
        pass


def get_or_set_cache(key, callback, timeout=None):
    """
    Get from cache or set if doesn't exist
    """
    cached_data = cache.get(key)
    if cached_data is not None:
        return cached_data
    
    data = callback()
    cache.set(key, data, timeout or 300)
    return data


class CacheManager:
    """
    Centralized cache management
    """
    
    @staticmethod
    def get_article(article_id):
        key = f"news:article:{article_id}"
        return cache.get(key)
    
    @staticmethod
    def set_article(article_id, data, timeout=None):
        key = f"news:article:{article_id}"
        cache.set(key, data, timeout or settings.CACHE_TTL.get('ARTICLE_DETAIL', 900))
    
    @staticmethod
    def invalidate_article(article_id):
        key = f"news:article:{article_id}"
        cache.delete(key)
    
    @staticmethod
    def get_category_articles(category_slug):
        key = f"news:category:{category_slug}:articles"
        return cache.get(key)
    
    @staticmethod
    def set_category_articles(category_slug, data, timeout=None):
        key = f"news:category:{category_slug}:articles"
        cache.set(key, data, timeout or settings.CACHE_TTL.get('ARTICLE_LIST', 300))
    
    @staticmethod
    def invalidate_category(category_slug):
        invalidate_cache_pattern(f"category:{category_slug}")
    
    @staticmethod
    def get_popular_articles():
        key = "news:popular:articles"
        return cache.get(key)
    
    @staticmethod
    def set_popular_articles(data, timeout=None):
        key = "news:popular:articles"
        cache.set(key, data, timeout or settings.CACHE_TTL.get('POPULAR_ARTICLES', 600))
    
    @staticmethod
    def get_trending_tags():
        key = "news:trending:tags"
        return cache.get(key)
    
    @staticmethod
    def set_trending_tags(data, timeout=None):
        key = "news:trending:tags"
        cache.set(key, data, timeout or settings.CACHE_TTL.get('TRENDING_TAGS', 900))
    
    @staticmethod
    def invalidate_all_articles():
        """Invalidate all article related caches"""
        patterns = ['article', 'category', 'tag', 'popular', 'trending']
        for pattern in patterns:
            invalidate_cache_pattern(pattern)
