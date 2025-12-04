from rest_framework import serializers
from .models import ArticleView, PopularArticle, SocialShare

class ArticleViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleView
        fields = '__all__'

class PopularArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PopularArticle
        fields = '__all__'

class SocialShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialShare
        fields = '__all__'
