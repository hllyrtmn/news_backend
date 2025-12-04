"""
Celery tasks for newsletter application.
"""

from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mass_mail
from django.template.loader import render_to_string
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_daily_newsletter(self):
    """
    Send daily newsletter to subscribers.
    Runs every day at 08:00 AM.
    """
    try:
        from .models import Newsletter, NewsletterSubscription
        from apps.articles.models import Article
        
        # Get daily newsletters
        daily_newsletters = Newsletter.objects.filter(
            frequency='daily',
            is_active=True
        )
        
        for newsletter in daily_newsletters:
            # Get articles from last 24 hours
            yesterday = timezone.now() - timedelta(hours=24)
            
            if newsletter.category:
                articles = Article.objects.filter(
                    category=newsletter.category,
                    status='published',
                    published_at__gte=yesterday
                ).order_by('-published_at')[:10]
            else:
                articles = Article.objects.filter(
                    status='published',
                    published_at__gte=yesterday
                ).order_by('-published_at')[:10]
            
            if not articles:
                logger.info(f"No articles for newsletter {newsletter.id}")
                continue
            
            # Get subscribers
            subscriptions = NewsletterSubscription.objects.filter(
                newsletter=newsletter,
                is_active=True,
                is_verified=True
            ).values_list('email', flat=True)
            
            if not subscriptions:
                logger.info(f"No subscribers for newsletter {newsletter.id}")
                continue
            
            # Prepare email content
            context = {
                'newsletter': newsletter,
                'articles': articles,
                'date': timezone.now().date(),
            }
            
            html_message = render_to_string(
                'newsletter/daily_newsletter.html',
                context
            )
            
            # Send emails
            subject = f"{newsletter.name} - {timezone.now().strftime('%d.%m.%Y')}"
            
            # Batch send emails
            emails = [
                (subject, html_message, 'noreply@example.com', [email])
                for email in subscriptions
            ]
            
            send_mass_mail(emails, fail_silently=True)
            
            logger.info(f"Sent daily newsletter {newsletter.id} to {len(subscriptions)} subscribers")
        
        return f"Daily newsletters sent successfully"
    
    except Exception as exc:
        logger.error(f"Error sending daily newsletter: {str(exc)}")
        raise self.retry(exc=exc, countdown=300)


@shared_task(bind=True, max_retries=3)
def send_weekly_newsletter(self):
    """
    Send weekly newsletter to subscribers.
    Runs every Monday at 08:00 AM.
    """
    try:
        from .models import Newsletter, NewsletterSubscription
        from apps.articles.models import Article
        
        # Get weekly newsletters
        weekly_newsletters = Newsletter.objects.filter(
            frequency='weekly',
            is_active=True
        )
        
        for newsletter in weekly_newsletters:
            # Get articles from last 7 days
            last_week = timezone.now() - timedelta(days=7)
            
            if newsletter.category:
                articles = Article.objects.filter(
                    category=newsletter.category,
                    status='published',
                    published_at__gte=last_week
                ).order_by('-published_at')[:20]
            else:
                articles = Article.objects.filter(
                    status='published',
                    published_at__gte=last_week
                ).order_by('-published_at')[:20]
            
            if not articles:
                logger.info(f"No articles for weekly newsletter {newsletter.id}")
                continue
            
            # Get subscribers
            subscriptions = NewsletterSubscription.objects.filter(
                newsletter=newsletter,
                is_active=True,
                is_verified=True
            ).values_list('email', flat=True)
            
            if not subscriptions:
                logger.info(f"No subscribers for weekly newsletter {newsletter.id}")
                continue
            
            # Prepare email content
            context = {
                'newsletter': newsletter,
                'articles': articles,
                'date': timezone.now().date(),
            }
            
            html_message = render_to_string(
                'newsletter/weekly_newsletter.html',
                context
            )
            
            # Send emails
            subject = f"{newsletter.name} - Haftalık Özet ({timezone.now().strftime('%d.%m.%Y')})"
            
            emails = [
                (subject, html_message, 'noreply@example.com', [email])
                for email in subscriptions
            ]
            
            send_mass_mail(emails, fail_silently=True)
            
            logger.info(f"Sent weekly newsletter {newsletter.id} to {len(subscriptions)} subscribers")
        
        return f"Weekly newsletters sent successfully"
    
    except Exception as exc:
        logger.error(f"Error sending weekly newsletter: {str(exc)}")
        raise self.retry(exc=exc, countdown=300)


@shared_task(bind=True, max_retries=3)
def send_monthly_newsletter(self):
    """
    Send monthly newsletter to subscribers.
    Runs on the first day of each month at 08:00 AM.
    """
    try:
        from .models import Newsletter, NewsletterSubscription
        from apps.articles.models import Article
        
        # Get monthly newsletters
        monthly_newsletters = Newsletter.objects.filter(
            frequency='monthly',
            is_active=True
        )
        
        for newsletter in monthly_newsletters:
            # Get articles from last 30 days
            last_month = timezone.now() - timedelta(days=30)
            
            if newsletter.category:
                articles = Article.objects.filter(
                    category=newsletter.category,
                    status='published',
                    published_at__gte=last_month
                ).order_by('-published_at')[:30]
            else:
                articles = Article.objects.filter(
                    status='published',
                    published_at__gte=last_month
                ).order_by('-published_at')[:30]
            
            if not articles:
                logger.info(f"No articles for monthly newsletter {newsletter.id}")
                continue
            
            # Get subscribers
            subscriptions = NewsletterSubscription.objects.filter(
                newsletter=newsletter,
                is_active=True,
                is_verified=True
            ).values_list('email', flat=True)
            
            if not subscriptions:
                logger.info(f"No subscribers for monthly newsletter {newsletter.id}")
                continue
            
            # Prepare email content
            context = {
                'newsletter': newsletter,
                'articles': articles,
                'date': timezone.now().date(),
            }
            
            html_message = render_to_string(
                'newsletter/monthly_newsletter.html',
                context
            )
            
            # Send emails
            subject = f"{newsletter.name} - Aylık Özet ({timezone.now().strftime('%B %Y')})"
            
            emails = [
                (subject, html_message, 'noreply@example.com', [email])
                for email in subscriptions
            ]
            
            send_mass_mail(emails, fail_silently=True)
            
            logger.info(f"Sent monthly newsletter {newsletter.id} to {len(subscriptions)} subscribers")
        
        return f"Monthly newsletters sent successfully"
    
    except Exception as exc:
        logger.error(f"Error sending monthly newsletter: {str(exc)}")
        raise self.retry(exc=exc, countdown=300)


@shared_task(bind=True, max_retries=3)
def cleanup_unverified_subscriptions(self):
    """
    Remove unverified subscriptions older than 7 days.
    Runs every day at 03:00 AM.
    """
    try:
        from .models import NewsletterSubscription
        
        # Delete unverified subscriptions older than 7 days
        cutoff_date = timezone.now() - timedelta(days=7)
        
        deleted_count, _ = NewsletterSubscription.objects.filter(
            is_verified=False,
            subscribed_at__lt=cutoff_date
        ).delete()
        
        logger.info(f"Deleted {deleted_count} unverified subscriptions")
        return f"Deleted {deleted_count} unverified subscriptions"
    
    except Exception as exc:
        logger.error(f"Error cleaning up unverified subscriptions: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)
