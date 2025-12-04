from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Avg, Count, Q
from django.utils import timezone
from django.core.cache import cache
from datetime import timedelta
import random

from .models import (
    AdvertisementZone, Advertiser, Campaign, Advertisement,
    AdImpression, AdClick, AdConversion, AdBlockDetection
)
from .serializers import (
    AdvertisementZoneSerializer, AdvertiserSerializer, CampaignSerializer,
    AdvertisementSerializer, AdvertisementPublicSerializer,
    AdImpressionSerializer, AdClickSerializer, AdConversionSerializer,
    AdStatisticsSerializer
)


class AdvertisementZoneViewSet(viewsets.ModelViewSet):
    """Reklam bölgeleri yönetimi"""
    queryset = AdvertisementZone.objects.all()
    serializer_class = AdvertisementZoneSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class AdvertiserViewSet(viewsets.ModelViewSet):
    """Reklamverenler yönetimi"""
    queryset = Advertiser.objects.all()
    serializer_class = AdvertiserSerializer
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Reklamveren istatistikleri"""
        advertiser = self.get_object()
        campaigns = advertiser.campaigns.all()
        
        stats = {
            'total_campaigns': campaigns.count(),
            'active_campaigns': campaigns.filter(status='active').count(),
            'total_spent': campaigns.aggregate(total=Sum('spent'))['total'] or 0,
            'total_impressions': campaigns.aggregate(total=Sum('total_impressions'))['total'] or 0,
            'total_clicks': campaigns.aggregate(total=Sum('total_clicks'))['total'] or 0,
            'total_conversions': campaigns.aggregate(total=Sum('total_conversions'))['total'] or 0,
        }
        
        return Response(stats)


class CampaignViewSet(viewsets.ModelViewSet):
    """Kampanya yönetimi"""
    queryset = Campaign.objects.select_related('advertiser').prefetch_related('target_categories')
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['status', 'advertiser']
    search_fields = ['name', 'advertiser__name']
    ordering_fields = ['created_at', 'start_date', 'end_date', 'total_impressions', 'total_clicks']
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Kampanyayı duraklat"""
        campaign = self.get_object()
        campaign.status = 'paused'
        campaign.save()
        return Response({'status': 'campaign paused'})
    
    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Kampanyayı devam ettir"""
        campaign = self.get_object()
        campaign.status = 'active'
        campaign.save()
        return Response({'status': 'campaign resumed'})
    
    @action(detail=True, methods=['get'])
    def performance(self, request, pk=None):
        """Kampanya performans raporu"""
        campaign = self.get_object()
        
        # Günlük performans
        daily_stats = AdImpression.objects.filter(
            advertisement__campaign=campaign
        ).extra(
            select={'date': 'DATE(viewed_at)'}
        ).values('date').annotate(
            impressions=Count('id'),
            clicks=Count('clicks')
        ).order_by('date')
        
        return Response({
            'campaign': CampaignSerializer(campaign).data,
            'daily_performance': daily_stats,
        })


class AdvertisementViewSet(viewsets.ModelViewSet):
    """Reklam yönetimi"""
    queryset = Advertisement.objects.select_related('campaign', 'zone', 'campaign__advertiser')
    serializer_class = AdvertisementSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['campaign', 'zone', 'ad_type', 'is_active']
    search_fields = ['name', 'campaign__name']
    ordering_fields = ['created_at', 'priority', 'impressions', 'clicks']
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def get_for_zone(self, request):
        """Belirli bir bölge için reklam getir"""
        zone_id = request.query_params.get('zone_id')
        page_url = request.query_params.get('page_url', '')
        
        if not zone_id:
            return Response({'error': 'zone_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Cache key oluştur
        cache_key = f'ad_zone_{zone_id}_{hash(page_url)}'
        cached_ad = cache.get(cache_key)
        
        if cached_ad:
            return Response(cached_ad)
        
        # Aktif reklamları getir
        now = timezone.now()
        ads = Advertisement.objects.filter(
            zone_id=zone_id,
            is_active=True,
            campaign__status='active',
            campaign__start_date__lte=now,
            campaign__end_date__gte=now,
        ).select_related('campaign', 'zone')
        
        # Kampanya bütçesi ve limitleri kontrol et
        valid_ads = []
        for ad in ads:
            campaign = ad.campaign
            if campaign.is_active:
                valid_ads.append(ad)
        
        if not valid_ads:
            return Response({'message': 'No active ads for this zone'}, status=status.HTTP_404_NOT_FOUND)
        
        # Ağırlıklı rastgele seçim (weighted random)
        total_weight = sum(ad.weight for ad in valid_ads)
        random_weight = random.randint(1, total_weight)
        
        cumulative_weight = 0
        selected_ad = valid_ads[0]
        
        for ad in valid_ads:
            cumulative_weight += ad.weight
            if random_weight <= cumulative_weight:
                selected_ad = ad
                break
        
        # Serialize et
        serializer = AdvertisementPublicSerializer(selected_ad)
        result = serializer.data
        
        # Cache'e kaydet (5 dakika)
        cache.set(cache_key, result, 300)
        
        return Response(result)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def track_impression(self, request, pk=None):
        """Reklam gösterimini kaydet"""
        ad = self.get_object()
        
        # IP ve User Agent al
        ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', '')).split(',')[0].strip()
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Son 1 dakika içinde aynı IP'den görüntüleme varsa sayma (spam önleme)
        one_minute_ago = timezone.now() - timedelta(minutes=1)
        recent_impression = AdImpression.objects.filter(
            advertisement=ad,
            ip_address=ip_address,
            viewed_at__gte=one_minute_ago
        ).exists()
        
        if recent_impression:
            return Response({'status': 'impression already tracked'})
        
        # Gösterimi kaydet
        impression_data = {
            'advertisement': ad.id,
            'user': request.user.id if request.user.is_authenticated else None,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'page_url': request.data.get('page_url', ''),
            'referrer': request.META.get('HTTP_REFERER', ''),
            'device_type': request.data.get('device_type', ''),
            'browser': request.data.get('browser', ''),
            'os': request.data.get('os', ''),
            'country': request.data.get('country', ''),
            'city': request.data.get('city', ''),
        }
        
        serializer = AdImpressionSerializer(data=impression_data)
        if serializer.is_valid():
            impression = serializer.save()
            
            # Reklam ve kampanya istatistiklerini güncelle
            ad.impressions += 1
            ad.save(update_fields=['impressions'])
            
            campaign = ad.campaign
            campaign.total_impressions += 1
            
            # CPM fiyatlandırma için harcama güncelle
            if campaign.pricing_model == 'cpm' and campaign.cpm_price:
                campaign.spent += campaign.cpm_price / 1000
            
            campaign.save(update_fields=['total_impressions', 'spent'])
            
            return Response({'status': 'impression tracked', 'impression_id': impression.id})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def track_click(self, request, pk=None):
        """Reklam tıklamasını kaydet"""
        ad = self.get_object()
        
        # IP ve User Agent al
        ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', '')).split(',')[0].strip()
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Son 1 dakika içinde aynı IP'den tıklama varsa sayma (spam önleme)
        one_minute_ago = timezone.now() - timedelta(minutes=1)
        recent_click = AdClick.objects.filter(
            advertisement=ad,
            ip_address=ip_address,
            clicked_at__gte=one_minute_ago
        ).exists()
        
        if recent_click:
            return Response({'status': 'click already tracked'})
        
        # Tıklamayı kaydet
        click_data = {
            'advertisement': ad.id,
            'impression': request.data.get('impression_id'),
            'user': request.user.id if request.user.is_authenticated else None,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'page_url': request.data.get('page_url', ''),
            'device_type': request.data.get('device_type', ''),
            'country': request.data.get('country', ''),
            'city': request.data.get('city', ''),
        }
        
        serializer = AdClickSerializer(data=click_data)
        if serializer.is_valid():
            click = serializer.save()
            
            # Reklam ve kampanya istatistiklerini güncelle
            ad.clicks += 1
            ad.save(update_fields=['clicks'])
            
            campaign = ad.campaign
            campaign.total_clicks += 1
            
            # CPC fiyatlandırma için harcama güncelle
            if campaign.pricing_model == 'cpc' and campaign.cpc_price:
                campaign.spent += campaign.cpc_price
            
            campaign.save(update_fields=['total_clicks', 'spent'])
            
            return Response({'status': 'click tracked', 'click_id': click.id})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def track_adblock(self, request):
        """AdBlock tespiti kaydet"""
        ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', '')).split(',')[0].strip()
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        AdBlockDetection.objects.create(
            ip_address=ip_address,
            user=request.user if request.user.is_authenticated else None,
            user_agent=user_agent,
            page_url=request.data.get('page_url', '')
        )
        
        return Response({'status': 'adblock detected'})


class AdStatisticsViewSet(viewsets.ViewSet):
    """Reklam istatistikleri ve raporlama"""
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Genel reklam istatistikleri dashboard"""
        period = request.query_params.get('period', 'daily')  # daily, weekly, monthly
        
        # Tarih aralığını belirle
        now = timezone.now()
        if period == 'daily':
            start_date = now - timedelta(days=1)
        elif period == 'weekly':
            start_date = now - timedelta(weeks=1)
        else:  # monthly
            start_date = now - timedelta(days=30)
        
        # İstatistikleri hesapla
        campaigns = Campaign.objects.filter(start_date__gte=start_date)
        impressions = AdImpression.objects.filter(viewed_at__gte=start_date)
        clicks = AdClick.objects.filter(clicked_at__gte=start_date)
        conversions = AdConversion.objects.filter(converted_at__gte=start_date)
        
        stats = {
            'period': period,
            'total_campaigns': campaigns.count(),
            'active_campaigns': campaigns.filter(status='active').count(),
            'total_impressions': impressions.count(),
            'total_clicks': clicks.count(),
            'total_conversions': conversions.count(),
            'total_revenue': campaigns.aggregate(total=Sum('spent'))['total'] or 0,
            'average_ctr': (clicks.count() / impressions.count() * 100) if impressions.count() > 0 else 0,
            'average_conversion_rate': (conversions.count() / clicks.count() * 100) if clicks.count() > 0 else 0,
            'top_performing_ads': Advertisement.objects.filter(
                campaign__start_date__gte=start_date
            ).order_by('-clicks')[:5].values('id', 'name', 'impressions', 'clicks'),
            'adblock_detections': AdBlockDetection.objects.filter(detected_at__gte=start_date).count(),
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def revenue_report(self, request):
        """Gelir raporu"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        campaigns = Campaign.objects.all()
        if start_date:
            campaigns = campaigns.filter(start_date__gte=start_date)
        if end_date:
            campaigns = campaigns.filter(end_date__lte=end_date)
        
        # Gelir dağılımı
        revenue_by_advertiser = campaigns.values(
            'advertiser__name'
        ).annotate(
            total_revenue=Sum('spent')
        ).order_by('-total_revenue')
        
        revenue_by_model = campaigns.values(
            'pricing_model'
        ).annotate(
            total_revenue=Sum('spent')
        )
        
        return Response({
            'total_revenue': campaigns.aggregate(total=Sum('spent'))['total'] or 0,
            'by_advertiser': revenue_by_advertiser,
            'by_pricing_model': revenue_by_model,
        })
