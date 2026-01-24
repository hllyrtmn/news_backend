from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from django.db import models
from utils.permissions import CanModerateComments
from utils.pagination import CommentPagination
from utils.helpers import get_client_ip
from utils.throttling import CommentRateThrottle
from .models import Comment, CommentLike
from .serializers import CommentSerializer
from .moderation import AutoModerator, ModerationStats, ProfanityFilter

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.filter(parent=None, status='approved')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = CommentPagination
    throttle_classes = [CommentRateThrottle]  # Rate limiting for comments
    
    def perform_create(self, serializer):
        content = serializer.validated_data.get('content', '')
        user = self.request.user if self.request.user.is_authenticated else None

        # Auto-moderate comment
        moderation_status, reason, scores = AutoModerator.moderate_comment(content, user)

        serializer.save(
            user=user,
            ip_address=get_client_ip(self.request),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')[:255],
            status=moderation_status  # Set auto-moderated status
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

    @action(detail=False, methods=['get'], permission_classes=[CanModerateComments])
    def moderation_queue(self, request):
        """
        Get comments pending moderation
        """
        pending_comments = Comment.objects.filter(
            status='pending'
        ).select_related('user', 'article').order_by('-created_at')

        page = self.paginate_queryset(pending_comments)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(pending_comments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[CanModerateComments])
    def approve(self, request, pk=None):
        """
        Approve a comment
        """
        comment = self.get_object()
        comment.status = 'approved'
        comment.save()
        return Response({
            'status': 'success',
            'message': 'Comment approved'
        })

    @action(detail=True, methods=['post'], permission_classes=[CanModerateComments])
    def reject(self, request, pk=None):
        """
        Reject a comment
        """
        comment = self.get_object()
        comment.status = 'rejected'
        comment.save()
        return Response({
            'status': 'success',
            'message': 'Comment rejected'
        })

    @action(detail=True, methods=['post'], permission_classes=[CanModerateComments])
    def mark_as_spam(self, request, pk=None):
        """
        Mark comment as spam
        """
        comment = self.get_object()
        comment.status = 'spam'
        comment.save()
        return Response({
            'status': 'success',
            'message': 'Comment marked as spam'
        })

    @action(detail=True, methods=['get'], permission_classes=[CanModerateComments])
    def analyze(self, request, pk=None):
        """
        Analyze comment for spam and profanity
        """
        comment = self.get_object()

        # Get moderation analysis
        moderation_status, reason, scores = AutoModerator.moderate_comment(
            comment.content,
            comment.user
        )

        # Get content flags
        flags = ModerationStats.get_content_flags(comment.content)

        return Response({
            'comment_id': comment.id,
            'current_status': comment.status,
            'recommended_status': moderation_status,
            'reason': reason,
            'scores': scores,
            'flags': flags
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def moderation_stats(self, request):
        """
        Get overall moderation statistics
        """
        from django.db.models import Count

        stats = Comment.objects.aggregate(
            total=Count('id'),
            approved=Count('id', filter=models.Q(status='approved')),
            pending=Count('id', filter=models.Q(status='pending')),
            spam=Count('id', filter=models.Q(status='spam')),
            rejected=Count('id', filter=models.Q(status='rejected'))
        )

        return Response(stats)
