from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdvertisementZoneViewSet, AdvertiserViewSet, CampaignViewSet,
    AdvertisementViewSet, AdStatisticsViewSet
)

router = DefaultRouter()
router.register(r'zones', AdvertisementZoneViewSet, basename='ad-zone')
router.register(r'advertisers', AdvertiserViewSet, basename='advertiser')
router.register(r'campaigns', CampaignViewSet, basename='campaign')
router.register(r'ads', AdvertisementViewSet, basename='advertisement')
router.register(r'statistics', AdStatisticsViewSet, basename='ad-statistics')

urlpatterns = [
    path('', include(router.urls)),
]
