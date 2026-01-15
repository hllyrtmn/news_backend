"""
Celery tasks for analytics application.
"""

from celery import shared_task
from django.utils import timezone
from django.db.models import Count, Sum, Avg, F
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def record_article_view(self, article_id, user_id=None, ip_address=None, user_agent=''):
    """
    Asynchronously record an article view.
    This prevents blocking the main request/response cycle.

    Args:
        article_id: ID of the article being viewed
        user_id: ID of the user (if authenticated)
        ip_address: IP address of the viewer
        user_agent: User agent string
    """
    try:
        from apps.articles.models import Article
        from .models import ArticleView
        from django.contrib.auth import get_user_model
        from datetime import timedelta

        User = get_user_model()

        # Get the article
        article = Article.objects.get(id=article_id)

        # Check if this IP has viewed this article in the last 24 hours
        time_threshold = timezone.now() - timedelta(hours=24)
        has_viewed = ArticleView.objects.filter(
            article=article,
            ip_address=ip_address,
            viewed_at__gte=time_threshold
        ).exists()

        if not has_viewed:
            # Increment view count (atomic operation to prevent race conditions)
            Article.objects.filter(id=article_id).update(views_count=F('views_count') + 1)

            # Create analytics record
            user = User.objects.get(id=user_id) if user_id else None
            ArticleView.objects.create(
                article=article,
                user=user,
                ip_address=ip_address,
                user_agent=user_agent[:255]
            )

            logger.info(f"Recorded view for article {article_id} from IP {ip_address}")
            return f"View recorded for article {article_id}"
        else:
            logger.debug(f"Duplicate view ignored for article {article_id} from IP {ip_address}")
            return f"Duplicate view ignored for article {article_id}"

    except Article.DoesNotExist:
        logger.error(f"Article {article_id} not found")
        return f"Article {article_id} not found"

    except Exception as exc:
        logger.error(f"Error recording view for article {article_id}: {str(exc)}")
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)


@shared_task(bind=True, max_retries=3)
def update_popular_articles(self):
    """
    Update popular articles based on views count.
    Runs every 30 minutes.
    """
    try:
        from apps.articles.models import Article
        from .models import PopularArticle
        
        # Calculate for different periods
        periods = {
            'daily': timedelta(days=1),
            'weekly': timedelta(weeks=1),
            'monthly': timedelta(days=30),
        }
        
        for period_name, period_delta in periods.items():
            start_date = timezone.now() - period_delta
            
            # Get top articles for this period
            top_articles = Article.objects.filter(
                status='published',
                published_at__gte=start_date
            ).order_by('-views_count')[:20]
            
            for article in top_articles:
                PopularArticle.objects.update_or_create(
                    article=article,
                    period=period_name,
                    date=timezone.now().date(),
                    defaults={
                        'views_count': article.views_count,
                        'score': article.views_count
                    }
                )
        
        logger.info(f"Updated popular articles for all periods")
        return "Popular articles updated"
    
    except Exception as exc:
        logger.error(f"Error updating popular articles: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def cleanup_old_views(self):
    """
    Clean up old view records (older than 180 days).
    Runs every day at 02:00 AM.
    """
    try:
        from .models import ArticleView
        
        # Delete view records older than 6 months
        cutoff_date = timezone.now() - timedelta(days=180)
        deleted_count, _ = ArticleView.objects.filter(
            viewed_at__lt=cutoff_date
        ).delete()
        
        logger.info(f"Deleted {deleted_count} old view records")
        return f"Deleted {deleted_count} old view records"
    
    except Exception as exc:
        logger.error(f"Error cleaning up old views: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def update_trending_tags(self):
    """
    Update trending tags based on usage.
    Runs every 15 minutes.
    """
    try:
        from apps.tags.models import Tag
        
        # Get tags used in last 7 days
        start_date = timezone.now() - timedelta(days=7)
        
        trending_tags = Tag.objects.filter(
            articles__status='published',
            articles__published_at__gte=start_date
        ).annotate(
            recent_usage=Count('articles', distinct=True)
        ).order_by('-recent_usage')[:20]
        
        logger.info(f"Updated {len(trending_tags)} trending tags")
        return f"Updated {len(trending_tags)} trending tags"
    
    except Exception as exc:
        logger.error(f"Error updating trending tags: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def update_author_statistics(self):
    """
    Update author statistics (total articles, total views, average rating).
    Runs every hour.
    """
    try:
        from apps.accounts.models import AuthorProfile
        from apps.articles.models import Article
        
        authors = AuthorProfile.objects.all()
        
        for author in authors:
            # Count total articles
            total_articles = Article.objects.filter(
                author=author,
                status='published'
            ).count()
            
            # Sum total views
            total_views = Article.objects.filter(
                author=author,
                status='published'
            ).aggregate(total=Sum('views_count'))['total'] or 0
            
            # Update author profile
            author.total_articles = total_articles
            author.total_views = total_views
            author.save(update_fields=['total_articles', 'total_views'])
        
        logger.info(f"Updated statistics for {len(authors)} authors")
        return f"Successfully updated statistics for {len(authors)} authors"
    
    except Exception as exc:
        logger.error(f"Error updating author statistics: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def generate_daily_report(self):
    """
    Generate daily analytics report.
    Runs every day at 08:00 AM.
    """
    try:
        from apps.articles.models import Article
        from .models import ArticleView
        
        today = timezone.now().date()
        
        # Get today's statistics
        today_views = ArticleView.objects.filter(
            viewed_at__date=today
        ).count()
        
        today_articles = Article.objects.filter(
            published_at__date=today,
            status='published'
        ).count()
        
        logger.info(f"Daily report - Views: {today_views}, Articles: {today_articles}")
        return f"Daily report generated - Views: {today_views}, Articles: {today_articles}"
    
    except Exception as exc:
        logger.error(f"Error generating daily report: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)
