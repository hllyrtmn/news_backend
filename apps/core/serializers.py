from rest_framework import serializers
from .models import SiteSettings, ContactMessage, Report

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        exclude = ('google_analytics_id',)

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ('name', 'email', 'subject', 'message')

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ('content_type', 'object_id', 'reason', 'description')
