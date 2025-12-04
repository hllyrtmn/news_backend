from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from utils.permissions import CanModerateComments
from utils.pagination import CommentPagination
from utils.helpers import get_client_ip
from .models import Comment, CommentLike
from .serializers import CommentSerializer

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.filter(parent=None, status='approved')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = CommentPagination
    
    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user if self.request.user.is_authenticated else None,
            ip_address=get_client_ip(self.request),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')[:255]
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticatedOrReadOnly])
    def like(self, request, pk=None):
        comment = self.get_object()
        CommentLike.objects.update_or_create(
            comment=comment,
            user=request.user,
            defaults={'is_like': True}
        )
        comment.likes_count += 1
        comment.save()
        return Response({'status': 'liked'})
