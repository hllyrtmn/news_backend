from django.db.models.signals import post_save, post_delete, m2m_changed
from django.dispatch import receiver
from utils.cache_utils import CacheManager
from .models import Article

@receiver(post_save, sender=Article)
def article_post_save(sender, instance, created, **kwargs):
    CacheManager.invalidate_article(instance.id)
    CacheManager.invalidate_category(instance.category.slug)
    CacheManager.invalidate_all_articles()

@receiver(m2m_changed, sender=Article.tags.through)
def article_tags_changed(sender, instance, **kwargs):
    CacheManager.invalidate_article(instance.id)
