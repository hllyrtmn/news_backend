from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.conf import settings
import mimetypes
import os

from .models import Media
from .serializers import (
    MediaSerializer,
    MediaListSerializer,
    MediaUploadSerializer,
    MediaOptimizedSerializer,
    PictureElementSerializer,
)
from .tasks import process_image_task, regenerate_image_variants_task, batch_process_images_task
from utils.pagination import StandardResultsSetPagination


class MediaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing media files with image optimization support.

    Supports:
    - Automatic WebP conversion
    - Responsive image generation
    - Lazy loading placeholders
    - Batch processing
    """
    queryset = Media.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['file_type', 'is_featured', 'processing_status', 'uploaded_by']

    def get_serializer_class(self):
        if self.action == 'create':
            return MediaUploadSerializer
        elif self.action == 'list':
            return MediaListSerializer
        elif self.action == 'optimized':
            return MediaOptimizedSerializer
        elif self.action == 'picture':
            return PictureElementSerializer
        return MediaSerializer

    def get_queryset(self):
        queryset = Media.objects.all()

        # Filter by optimization status
        optimized = self.request.query_params.get('optimized')
        if optimized is not None:
            if optimized.lower() == 'true':
                queryset = queryset.filter(processing_status='completed')
            elif optimized.lower() == 'false':
                queryset = queryset.exclude(processing_status='completed')

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """Create media and trigger async image processing."""
        # Get file info
        file = self.request.FILES.get('file')
        if file:
            mime_type, _ = mimetypes.guess_type(file.name)
            file_size = file.size

            instance = serializer.save(
                uploaded_by=self.request.user,
                mime_type=mime_type or '',
                file_size=file_size,
            )

            # Trigger async image processing for images
            if instance.file_type == 'image':
                process_image_task.delay(instance.id)
        else:
            serializer.save(uploaded_by=self.request.user)

    @action(detail=True, methods=['get'])
    def optimized(self, request, pk=None):
        """
        Get optimized image data for lazy loading.

        Returns minimal data needed for frontend lazy loading implementation.
        """
        media = self.get_object()

        if not media.is_image:
            return Response(
                {'error': 'Bu dosya bir görsel değil'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = MediaOptimizedSerializer(media)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def picture(self, request, pk=None):
        """
        Get data formatted for HTML <picture> element.

        Use this endpoint to get properly formatted data for
        implementing responsive images with WebP support.
        """
        media = self.get_object()

        if not media.is_image:
            return Response(
                {'error': 'Bu dosya bir görsel değil'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = PictureElementSerializer(media)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reprocess(self, request, pk=None):
        """
        Manually trigger reprocessing of an image.

        Admin only. Useful when optimization settings change
        or processing failed previously.
        """
        media = self.get_object()

        if not media.is_image:
            return Response(
                {'error': 'Bu dosya bir görsel değil'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get specific variants to regenerate (optional)
        variants = request.data.get('variants')

        # Reset status and trigger processing
        media.processing_status = 'pending'
        media.save(update_fields=['processing_status'])

        if variants:
            regenerate_image_variants_task.delay(media.id, variants)
        else:
            process_image_task.delay(media.id)

        return Response({
            'message': 'Görsel yeniden işleme kuyruğuna eklendi',
            'media_id': media.id,
            'status': 'pending'
        })

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def batch_reprocess(self, request):
        """
        Batch reprocess multiple images.

        Admin only. Accepts list of media IDs or filter criteria.
        """
        media_ids = request.data.get('media_ids', [])
        reprocess_failed = request.data.get('reprocess_failed', False)
        reprocess_pending = request.data.get('reprocess_pending', False)

        if not media_ids and not reprocess_failed and not reprocess_pending:
            return Response(
                {'error': 'media_ids, reprocess_failed veya reprocess_pending belirtilmeli'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Build queryset
        queryset = Media.objects.filter(file_type='image')

        if media_ids:
            queryset = queryset.filter(id__in=media_ids)
        else:
            status_filters = []
            if reprocess_failed:
                status_filters.append('failed')
            if reprocess_pending:
                status_filters.append('pending')
            queryset = queryset.filter(processing_status__in=status_filters)

        ids_to_process = list(queryset.values_list('id', flat=True)[:500])

        if not ids_to_process:
            return Response({
                'message': 'İşlenecek görsel bulunamadı',
                'count': 0
            })

        # Update status to pending
        queryset.filter(id__in=ids_to_process).update(processing_status='pending')

        # Trigger batch processing
        batch_process_images_task.delay(ids_to_process)

        return Response({
            'message': 'Toplu işleme başlatıldı',
            'count': len(ids_to_process),
            'media_ids': ids_to_process
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get media optimization statistics.
        """
        total = Media.objects.filter(file_type='image').count()
        optimized = Media.objects.filter(
            file_type='image',
            processing_status='completed'
        ).count()
        pending = Media.objects.filter(
            file_type='image',
            processing_status='pending'
        ).count()
        processing = Media.objects.filter(
            file_type='image',
            processing_status='processing'
        ).count()
        failed = Media.objects.filter(
            file_type='image',
            processing_status='failed'
        ).count()

        return Response({
            'total_images': total,
            'optimized': optimized,
            'pending': pending,
            'processing': processing,
            'failed': failed,
            'optimization_rate': f'{(optimized / total * 100):.1f}%' if total > 0 else '0%'
        })
