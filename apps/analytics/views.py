from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Count, Sum
from .models import ArticleView, PopularArticle

@api_view(['GET'])
def dashboard_stats(request):
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
