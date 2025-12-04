from rest_framework import serializers
from .models import Comment, CommentLike

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ('user', 'likes_count', 'dislikes_count', 'ip_address', 'user_agent', 'created_at', 'updated_at')
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() if obj.user else obj.name
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.filter(status='approved'), many=True).data
        return []
