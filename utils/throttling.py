"""
Custom throttling classes for API rate limiting
Provides granular control over different endpoint types
"""

from rest_framework.throttling import UserRateThrottle, AnonRateThrottle


class CommentRateThrottle(AnonRateThrottle):
    """
    Strict rate limiting for comment endpoints
    Prevents spam and abuse
    """
    scope = 'comment'


class AuthRateThrottle(AnonRateThrottle):
    """
    Rate limiting for authentication endpoints
    Prevents brute force attacks
    """
    scope = 'auth'


class ReadRateThrottle(AnonRateThrottle):
    """
    Relaxed rate limiting for read-only endpoints
    """
    scope = 'read'


class WriteRateThrottle(AnonRateThrottle):
    """
    Moderate rate limiting for write operations
    """
    scope = 'write'


class BurstRateThrottle(UserRateThrottle):
    """
    Short burst protection for authenticated users
    Prevents rapid-fire requests
    """
    scope = 'burst'


class SustainedRateThrottle(UserRateThrottle):
    """
    Long-term rate limiting for authenticated users
    """
    scope = 'sustained'


class PremiumUserRateThrottle(UserRateThrottle):
    """
    Higher rate limits for premium/subscriber users
    """
    scope = 'premium'

    def allow_request(self, request, view):
        # Check if user is premium/subscriber
        if request.user and request.user.is_authenticated:
            if hasattr(request.user, 'user_type'):
                if request.user.user_type in ['subscriber', 'premium']:
                    # Premium users get 10x the normal limit
                    return True
        return super().allow_request(request, view)


class AdminRateThrottle(UserRateThrottle):
    """
    No rate limiting for admin/staff users
    """
    scope = 'admin'

    def allow_request(self, request, view):
        # Admins and staff have no rate limits
        if request.user and request.user.is_authenticated:
            if request.user.is_staff or request.user.is_superuser:
                return True
        return super().allow_request(request, view)
