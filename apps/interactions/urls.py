from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LikeViewSet, ShareViewSet

router = DefaultRouter()
router.register(r'likes', LikeViewSet, basename='like')
router.register(r'shares', ShareViewSet, basename='share')

urlpatterns = [
    path('', include(router.urls)),
]

# Bookmark ve ReadHistory endpoints artık /api/v1/bookmarks/ altında