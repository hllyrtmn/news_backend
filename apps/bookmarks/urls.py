from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookmarkFolderViewSet, BookmarkViewSet, ReadingHistoryViewSet, ReadingListViewSet

router = DefaultRouter()
router.register(r'folders', BookmarkFolderViewSet, basename='bookmark-folder')
router.register(r'bookmarks', BookmarkViewSet, basename='bookmark')
router.register(r'history', ReadingHistoryViewSet, basename='reading-history')
router.register(r'lists', ReadingListViewSet, basename='reading-list')

urlpatterns = [
    path('', include(router.urls)),
]
