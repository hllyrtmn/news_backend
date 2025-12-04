from django_filters import rest_framework as filters
from .models import Article

class ArticleFilter(filters.FilterSet):
    title = filters.CharFilter(lookup_expr='icontains')
    category = filters.CharFilter(field_name='category__slug')
    tag = filters.CharFilter(field_name='tags__slug')
    author = filters.CharFilter(field_name='author__slug')
    status = filters.ChoiceFilter(choices=Article.STATUS_CHOICES)
    is_featured = filters.BooleanFilter()
    is_breaking = filters.BooleanFilter()
    published_after = filters.DateTimeFilter(field_name='published_at', lookup_expr='gte')
    published_before = filters.DateTimeFilter(field_name='published_at', lookup_expr='lte')
    
    class Meta:
        model = Article
        fields = ['title', 'category', 'tag', 'author', 'status', 'is_featured', 'is_breaking']
