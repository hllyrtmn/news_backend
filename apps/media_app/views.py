from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Media
from .serializers import MediaSerializer, MediaUploadSerializer
from utils.pagination import StandardResultsSetPagination

class MediaViewSet(viewsets.ModelViewSet):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MediaUploadSerializer
        return MediaSerializer
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
