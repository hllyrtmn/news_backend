from rest_framework import serializers
from .models import (
    AdvertisementZone, Advertiser, Campaign, Advertisement,
    AdImpression, AdClick, AdConversion
)


class AdvertisementZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvertisementZone
        fields = '__all__'


class AdvertiserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Advertiser
        fields = '__all__'


class CampaignSerializer(serializers.ModelSerializer):
    advertiser_name = serializers.CharField(source='advertiser.name', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    ctr = serializers.FloatField(read_only=True)
    conversion_rate = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Campaign
        fields = '__all__'
        read_only_fields = ['total_impressions', 'total_clicks', 'total_conversions', 'spent']


class AdvertisementSerializer(serializers.ModelSerializer):
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    zone_name = serializers.CharField(source='zone.name', read_only=True)
    ctr = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Advertisement
        fields = '__all__'
        read_only_fields = ['impressions', 'clicks', 'conversions']


class AdvertisementPublicSerializer(serializers.ModelSerializer):
    """Frontend için public reklam serializer"""
    zone_name = serializers.CharField(source='zone.name', read_only=True)
    zone_width = serializers.IntegerField(source='zone.width', read_only=True)
    zone_height = serializers.IntegerField(source='zone.height', read_only=True)
    
    class Meta:
        model = Advertisement
        fields = [
            'id', 'name', 'ad_type', 'image', 'video_url', 'html_content', 
            'script_code', 'title', 'description', 'thumbnail', 'target_url', 
            'open_in_new_tab', 'zone_name', 'zone_width', 'zone_height'
        ]


class AdImpressionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdImpression
        fields = '__all__'
        read_only_fields = ['viewed_at']


class AdClickSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdClick
        fields = '__all__'
        read_only_fields = ['clicked_at']


class AdConversionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdConversion
        fields = '__all__'
        read_only_fields = ['converted_at']


class AdStatisticsSerializer(serializers.Serializer):
    """Reklam istatistikleri için serializer"""
    period = serializers.CharField()
    total_impressions = serializers.IntegerField()
    total_clicks = serializers.IntegerField()
    total_conversions = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_ctr = serializers.FloatField()
    average_conversion_rate = serializers.FloatField()
