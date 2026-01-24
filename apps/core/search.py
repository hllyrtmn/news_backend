"""
Global Search Functionality using PostgreSQL Full-Text Search
"""
from django.contrib.postgres.search import (
    SearchVector, SearchQuery, SearchRank, TrigramSimilarity
)
from django.db.models import Q, F
from apps.articles.models import Article
from apps.accounts.models import AuthorProfile
from apps.categories.models import Category
from apps.tags.models import Tag


class GlobalSearch:
    """
    Global search across articles, authors, categories, and tags
    """

    @staticmethod
    def search_articles(query, limit=20):
        """
        Full-text search in articles
        Searches: title, subtitle, summary, content
        """
        if not query:
            return Article.objects.none()

        # Create search vector for multiple fields with different weights
        search_vector = (
            SearchVector('title', weight='A') +
            SearchVector('subtitle', weight='B') +
            SearchVector('summary', weight='B') +
            SearchVector('content', weight='C')
        )

        # Create search query
        search_query = SearchQuery(query, search_type='websearch')

        # Search with ranking
        articles = Article.objects.filter(
            status='published'
        ).annotate(
            search=search_vector,
            rank=SearchRank(search_vector, search_query)
        ).filter(
            search=search_query
        ).order_by('-rank', '-published_at')[:limit]

        return articles

    @staticmethod
    def search_articles_simple(query, limit=20):
        """
        Simple search using icontains (fallback for non-PostgreSQL)
        """
        if not query:
            return Article.objects.none()

        return Article.objects.filter(
            Q(title__icontains=query) |
            Q(subtitle__icontains=query) |
            Q(summary__icontains=query) |
            Q(content__icontains=query),
            status='published'
        ).distinct().order_by('-published_at')[:limit]

    @staticmethod
    def search_authors(query, limit=10):
        """
        Search authors by name, specialty
        """
        if not query:
            return AuthorProfile.objects.none()

        return AuthorProfile.objects.filter(
            Q(display_name__icontains=query) |
            Q(user__username__icontains=query) |
            Q(specialty__icontains=query) |
            Q(bio_long__icontains=query)
        ).distinct()[:limit]

    @staticmethod
    def search_categories(query, limit=10):
        """
        Search categories by name, description
        """
        if not query:
            return Category.objects.none()

        return Category.objects.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query)
        ).distinct()[:limit]

    @staticmethod
    def search_tags(query, limit=10):
        """
        Search tags by name
        """
        if not query:
            return Tag.objects.none()

        return Tag.objects.filter(
            name__icontains=query
        ).distinct()[:limit]

    @staticmethod
    def autocomplete_articles(query, limit=10):
        """
        Autocomplete suggestions for articles (title only, fast)
        """
        if not query or len(query) < 2:
            return []

        articles = Article.objects.filter(
            title__icontains=query,
            status='published'
        ).values('id', 'title', 'slug')[:limit]

        return list(articles)

    @staticmethod
    def autocomplete_mixed(query, limit=10):
        """
        Mixed autocomplete: articles, authors, categories
        """
        if not query or len(query) < 2:
            return {'articles': [], 'authors': [], 'categories': []}

        articles = Article.objects.filter(
            title__icontains=query,
            status='published'
        ).values('id', 'title', 'slug')[:5]

        authors = AuthorProfile.objects.filter(
            display_name__icontains=query
        ).values('id', 'display_name', 'slug')[:3]

        categories = Category.objects.filter(
            name__icontains=query
        ).values('id', 'name', 'slug')[:2]

        return {
            'articles': list(articles),
            'authors': list(authors),
            'categories': list(categories)
        }

    @staticmethod
    def search_all(query, article_limit=20, author_limit=5, category_limit=5, tag_limit=5):
        """
        Search across all content types
        """
        if not query:
            return {
                'articles': [],
                'authors': [],
                'categories': [],
                'tags': [],
                'total_count': 0
            }

        # Try full-text search first (PostgreSQL)
        try:
            articles = GlobalSearch.search_articles(query, article_limit)
        except Exception:
            # Fallback to simple search
            articles = GlobalSearch.search_articles_simple(query, article_limit)

        authors = GlobalSearch.search_authors(query, author_limit)
        categories = GlobalSearch.search_categories(query, category_limit)
        tags = GlobalSearch.search_tags(query, tag_limit)

        total_count = (
            articles.count() +
            authors.count() +
            categories.count() +
            tags.count()
        )

        return {
            'articles': articles,
            'authors': authors,
            'categories': categories,
            'tags': tags,
            'total_count': total_count,
            'query': query
        }


class SearchSuggestions:
    """
    Generate search suggestions based on popular searches and content
    """

    @staticmethod
    def get_popular_searches(limit=10):
        """
        Get popular search terms (from analytics if available)
        """
        # TODO: Implement search analytics tracking
        # For now, return popular tags
        from apps.tags.models import Tag
        return Tag.objects.order_by('-article_count')[:limit]

    @staticmethod
    def get_trending_topics(limit=10):
        """
        Get trending article topics
        """
        from apps.tags.models import Tag
        from django.utils import timezone
        from datetime import timedelta

        # Articles from last 7 days
        week_ago = timezone.now() - timedelta(days=7)

        # Get tags from trending articles
        trending_tags = Tag.objects.filter(
            articles__published_at__gte=week_ago,
            articles__status='published'
        ).distinct().order_by('-article_count')[:limit]

        return trending_tags

    @staticmethod
    def get_related_searches(query, limit=5):
        """
        Get related search suggestions based on query
        """
        if not query or len(query) < 2:
            return []

        # Find tags similar to query
        related_tags = Tag.objects.filter(
            name__icontains=query
        )[:limit]

        return [tag.name for tag in related_tags]
