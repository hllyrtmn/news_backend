from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.db.models import Count, Sum, Avg, Q, F
from django.utils import timezone
from datetime import timedelta
from .models import ArticleView, PopularArticle


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Basit dashboard istatistikleri (tüm kullanıcılar için)
    """
    from apps.articles.models import Article
    from apps.accounts.models import CustomUser
    from apps.comments.models import Comment

    stats = {
        'total_articles': Article.objects.filter(status='published').count(),
        'total_users': CustomUser.objects.filter(is_active=True).count(),
        'total_views': ArticleView.objects.count(),
        'total_comments': Comment.objects.filter(status='approved').count(),
    }
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
    """
    Detaylı admin dashboard istatistikleri
    Grafikler, trendler, performans metrikleri
    """
    from apps.articles.models import Article
    from apps.accounts.models import CustomUser, AuthorProfile
    from apps.comments.models import Comment
    from apps.categories.models import Category
    from apps.interactions.models import Like, Share

    now = timezone.now()
    today = now.date()
    yesterday = today - timedelta(days=1)
    last_7_days = now - timedelta(days=7)
    last_30_days = now - timedelta(days=30)

    # === GENEL İSTATİSTİKLER ===
    general_stats = {
        'total_articles': Article.objects.filter(status='published').count(),
        'draft_articles': Article.objects.filter(status='draft').count(),
        'pending_articles': Article.objects.filter(status='pending').count(),
        'total_users': CustomUser.objects.filter(is_active=True).count(),
        'total_authors': AuthorProfile.objects.count(),
        'total_views': ArticleView.objects.count(),
        'total_comments': Comment.objects.count(),
        'approved_comments': Comment.objects.filter(status='approved').count(),
        'pending_comments': Comment.objects.filter(status='pending').count(),
        'total_likes': Like.objects.count(),
        'total_shares': Share.objects.count(),
    }

    # === BUGÜN VS DÜNLE KARŞILAŞTIRMA ===
    today_stats = {
        'articles': Article.objects.filter(published_at__date=today).count(),
        'views': ArticleView.objects.filter(viewed_at__date=today).count(),
        'comments': Comment.objects.filter(created_at__date=today).count(),
        'users': CustomUser.objects.filter(date_joined__date=today).count(),
        'likes': Like.objects.filter(created_at__date=today).count(),
    }

    yesterday_stats = {
        'articles': Article.objects.filter(published_at__date=yesterday).count(),
        'views': ArticleView.objects.filter(viewed_at__date=yesterday).count(),
        'comments': Comment.objects.filter(created_at__date=yesterday).count(),
        'users': CustomUser.objects.filter(date_joined__date=yesterday).count(),
        'likes': Like.objects.filter(created_at__date=yesterday).count(),
    }

    # === TRENDLER (Son 7 gün) ===
    daily_views_trend = []
    daily_articles_trend = []
    for i in range(7):
        day = today - timedelta(days=i)
        daily_views_trend.insert(0, {
            'date': day.isoformat(),
            'views': ArticleView.objects.filter(viewed_at__date=day).count()
        })
        daily_articles_trend.insert(0, {
            'date': day.isoformat(),
            'articles': Article.objects.filter(published_at__date=day).count()
        })

    # === EN POPÜLER MAKALELER (Son 7 gün) ===
    top_articles_7d = Article.objects.filter(
        published_at__gte=last_7_days,
        status='published'
    ).order_by('-views_count')[:10].values(
        'id', 'title', 'slug', 'views_count', 'published_at'
    )

    # === EN AKTİF YAZARLAR (Son 30 gün) ===
    top_authors = AuthorProfile.objects.annotate(
        article_count=Count('articles', filter=Q(
            articles__published_at__gte=last_30_days,
            articles__status='published'
        )),
        total_views=Sum('articles__views_count', filter=Q(
            articles__published_at__gte=last_30_days,
            articles__status='published'
        ))
    ).filter(article_count__gt=0).order_by('-total_views')[:10].values(
        'id', 'display_name', 'slug', 'article_count', 'total_views'
    )

    # === KATEGORİ PERFORMANSI ===
    category_stats = Category.objects.annotate(
        article_count=Count('articles', filter=Q(articles__status='published')),
        total_views=Sum('articles__views_count', filter=Q(articles__status='published'))
    ).filter(article_count__gt=0).order_by('-total_views')[:10].values(
        'id', 'name', 'slug', 'article_count', 'total_views'
    )

    # === MAKALE TİPİ DAĞILIMI ===
    article_type_distribution = Article.objects.filter(
        status='published'
    ).values('article_type').annotate(
        count=Count('id')
    ).order_by('-count')

    # === YORUM İSTATİSTİKLERİ ===
    comment_stats = {
        'total': Comment.objects.count(),
        'approved': Comment.objects.filter(status='approved').count(),
        'pending': Comment.objects.filter(status='pending').count(),
        'rejected': Comment.objects.filter(status='rejected').count(),
        'today': Comment.objects.filter(created_at__date=today).count(),
    }

    # === KULLANICI İSTATİSTİKLERİ ===
    user_type_distribution = CustomUser.objects.filter(
        is_active=True
    ).values('user_type').annotate(
        count=Count('id')
    )

    # === ORTALAMALAR ===
    averages = {
        'avg_views_per_article': Article.objects.filter(
            status='published'
        ).aggregate(avg=Avg('views_count'))['avg'] or 0,
        'avg_comments_per_article': Comment.objects.filter(
            status='approved'
        ).values('article').annotate(
            count=Count('id')
        ).aggregate(avg=Avg('count'))['avg'] or 0,
    }

    # === RESPONSE ===
    return Response({
        'general': general_stats,
        'today': today_stats,
        'yesterday': yesterday_stats,
        'comparison': {
            'articles_change': calculate_percentage_change(
                today_stats['articles'],
                yesterday_stats['articles']
            ),
            'views_change': calculate_percentage_change(
                today_stats['views'],
                yesterday_stats['views']
            ),
            'comments_change': calculate_percentage_change(
                today_stats['comments'],
                yesterday_stats['comments']
            ),
        },
        'trends': {
            'daily_views': daily_views_trend,
            'daily_articles': daily_articles_trend,
        },
        'top_articles_7d': list(top_articles_7d),
        'top_authors': list(top_authors),
        'category_stats': list(category_stats),
        'article_type_distribution': list(article_type_distribution),
        'comment_stats': comment_stats,
        'user_type_distribution': list(user_type_distribution),
        'averages': averages,
    })


def calculate_percentage_change(current, previous):
    """Yüzde değişim hesapla"""
    if previous == 0:
        return 100 if current > 0 else 0
    return round(((current - previous) / previous) * 100, 2)
