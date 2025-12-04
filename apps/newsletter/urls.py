from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NewsletterViewSet, NewsletterSubscriptionCreateView

router = DefaultRouter()
router.register(r'', NewsletterViewSet, basename='newsletter')

urlpatterns = [
    path('', include(router.urls)),
    path('subscribe/', NewsletterSubscriptionCreateView.as_view(), name='subscribe'),
]
