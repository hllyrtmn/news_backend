from rest_framework import serializers
from .models import Newsletter, NewsletterSubscription

class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Newsletter
        fields = ('id', 'name', 'description', 'frequency')

class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = ('email', 'newsletter')
