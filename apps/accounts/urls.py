from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView,
    UserProfileView,
    ChangePasswordView,
    UserPreferenceView,
    AuthorProfileViewSet,
    CustomTokenObtainPairView,
    TwoFactorSetupView,
    TwoFactorVerifyView,
    TwoFactorDisableView,
    TwoFactorStatusView,
)

router = DefaultRouter()
router.register(r'authors', AuthorProfileViewSet, basename='author')

urlpatterns = [
    # Authentication (custom endpoints)
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # dj-rest-auth endpoints (email verification & password reset)
    path('dj-rest-auth/', include('dj_rest_auth.urls')),
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),

    # Social authentication
    path('social/', include('allauth.socialaccount.urls')),

    # Profile
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('preferences/', UserPreferenceView.as_view(), name='user-preferences'),

    # Two-Factor Authentication
    path('2fa/setup/', TwoFactorSetupView.as_view(), name='2fa-setup'),
    path('2fa/verify/', TwoFactorVerifyView.as_view(), name='2fa-verify'),
    path('2fa/disable/', TwoFactorDisableView.as_view(), name='2fa-disable'),
    path('2fa/status/', TwoFactorStatusView.as_view(), name='2fa-status'),

    # Authors
    path('', include(router.urls)),
]
