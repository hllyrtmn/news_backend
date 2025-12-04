from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from apps.articles.models import Article
from apps.categories.models import Category
from apps.tags.models import Tag


class ArticleSitemap(Sitemap):
    changefreq = "daily"
    priority = 0.9
    protocol = 'https'
    
    def items(self):
        return Article.objects.filter(status='published').order_by('-published_at')
    
    def lastmod(self, obj):
        return obj.updated_at
    
    def location(self, obj):
        return f'/articles/{obj.slug}/'


class CategorySitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.7
    protocol = 'https'
    
    def items(self):
        return Category.objects.filter(is_active=True)
    
    def lastmod(self, obj):
        return obj.updated_at
    
    def location(self, obj):
        return f'/categories/{obj.slug}/'


class TagSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.5
    protocol = 'https'
    
    def items(self):
        return Tag.objects.all()
    
    def location(self, obj):
        return f'/tags/{obj.slug}/'


class StaticViewSitemap(Sitemap):
    priority = 0.5
    changefreq = 'monthly'
    protocol = 'https'
    
    def items(self):
        return ['home', 'about', 'contact']
    
    def location(self, item):
        return f'/{item}/'


# Sitemap sözlüğü
sitemaps = {
    'articles': ArticleSitemap,
    'categories': CategorySitemap,
    'tags': TagSitemap,
    'static': StaticViewSitemap,
}
