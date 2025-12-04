from rest_framework import serializers
from .models import Media

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = '__all__'
        read_only_fields = ('uploaded_by', 'created_at', 'file_size', 'mime_type')

class MediaUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ('file', 'title', 'alt_text', 'caption', 'file_type')
