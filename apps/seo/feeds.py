from django.contrib.syndication.views import Feed
from django.urls import reverse
from django.utils.feedgenerator import Atom1Feed
from apps.articles.models import Article
from apps.categories.models import Category


class LatestArticlesFeed(Feed):
    title = "Haber Sitesi - Son Haberler"
    link = "/rss/"
    description = "En son haberler ve gelişmeler"
    
    def items(self):
        return Article.objects.filter(status='published').order_by('-published_at')[:20]
    
    def item_title(self, item):
        return item.title
    
    def item_description(self, item):
        return item.summary
    
    def item_link(self, item):
        return f'/articles/{item.slug}/'
    
    def item_pubdate(self, item):
        return item.published_at
    
    def item_author_name(self, item):
        return item.author.user.get_full_name() if item.author else "Editör"
    
    def item_categories(self, item):
        return [item.category.name] + [tag.name for tag in item.tags.all()]
    
    def item_enclosure_url(self, item):
        if item.featured_image and item.featured_image.file:
            return item.featured_image.file.url
        return None
    
    def item_enclosure_length(self, item):
        if item.featured_image and item.featured_image.file:
            try:
                return item.featured_image.file.size
            except:
                return 0
        return 0
    
    def item_enclosure_mime_type(self, item):
        return "image/jpeg"


class LatestArticlesAtomFeed(LatestArticlesFeed):
    feed_type = Atom1Feed
    subtitle = LatestArticlesFeed.description


class CategoryFeed(Feed):
    def get_object(self, request, slug):
        return Category.objects.get(slug=slug)
    
    def title(self, obj):
        return f"Haber Sitesi - {obj.name}"
    
    def link(self, obj):
        return f'/categories/{obj.slug}/'
    
    def description(self, obj):
        return obj.description or f"{obj.name} kategorisindeki son haberler"
    
    def items(self, obj):
        return Article.objects.filter(
            category=obj, 
            status='published'
        ).order_by('-published_at')[:20]
    
    def item_title(self, item):
        return item.title
    
    def item_description(self, item):
        return item.summary
    
    def item_link(self, item):
        return f'/articles/{item.slug}/'
    
    def item_pubdate(self, item):
        return item.published_at


class BreakingNewsFeed(Feed):
    title = "Haber Sitesi - Son Dakika"
    link = "/rss/breaking/"
    description = "Son dakika haberleri"
    
    def items(self):
        return Article.objects.filter(
            status='published',
            is_breaking=True
        ).order_by('-published_at')[:10]
    
    def item_title(self, item):
        return f"SON DAKİKA: {item.title}"
    
    def item_description(self, item):
        return item.summary
    
    def item_link(self, item):
        return f'/articles/{item.slug}/'
    
    def item_pubdate(self, item):
        return item.published_at
