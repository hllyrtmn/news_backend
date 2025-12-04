from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Only the author can edit/delete, others can read
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.author.user == request.user


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Only the owner can edit/delete, others can read
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.user == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Only admins can edit/delete, others can read
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user and request.user.is_staff


class IsEditorOrAdmin(permissions.BasePermission):
    """
    Only editors and admins can access
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.user_type in ['editor', 'admin']
        )


class IsAuthorEditorOrAdmin(permissions.BasePermission):
    """
    Authors, editors and admins can access
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.user_type in ['author', 'editor', 'admin']
        )


class CanPublishArticle(permissions.BasePermission):
    """
    Only editors and admins can publish articles
    """
    def has_permission(self, request, view):
        if request.data.get('status') == 'published':
            return (
                request.user and 
                request.user.is_authenticated and 
                request.user.user_type in ['editor', 'admin']
            )
        return True


class CanModerateComments(permissions.BasePermission):
    """
    Only moderators, editors and admins can moderate comments
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.user_type in ['editor', 'admin']
        )
