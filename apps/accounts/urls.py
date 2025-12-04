from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView,
    UserProfileView,
    ChangePasswordView,
    UserPreferenceView,
    AuthorProfileViewSet,
    CustomTokenObtainPairView
)

router = DefaultRouter()
router.register(r'authors', AuthorProfileViewSet, basename='author')

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('preferences/', UserPreferenceView.as_view(), name='user-preferences'),
    
    # Authors
    path('', include(router.urls)),
]
