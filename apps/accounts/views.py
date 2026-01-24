from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter
from utils.pagination import SmallResultsSetPagination
from .models import AuthorProfile, UserPreference
from .serializers import (
    UserRegisterSerializer,
    UserSerializer,
    UserProfileSerializer,
    AuthorProfileSerializer,
    AuthorProfileMinimalSerializer,
    UserPreferenceSerializer,
    ChangePasswordSerializer,
    UpdatePreferencesSerializer,
    CustomTokenObtainPairSerializer,
    TwoFactorSetupSerializer,
    TwoFactorVerifySerializer,
    TwoFactorDisableSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint
    """
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegisterSerializer
    
    @extend_schema(
        summary="Kullanıcı Kaydı",
        description="Yeni kullanıcı kaydı oluşturur",
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get and update user profile
    """
    serializer_class = UserProfileSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_object(self):
        return self.request.user
    
    @extend_schema(
        summary="Profil Bilgisi",
        description="Oturum açmış kullanıcının profil bilgilerini döndürür",
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @extend_schema(
        summary="Profil Güncelleme",
        description="Kullanıcı profil bilgilerini günceller",
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


class ChangePasswordView(generics.UpdateAPIView):
    """
    Change password endpoint
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = (IsAuthenticated,)
    
    @extend_schema(
        summary="Şifre Değiştirme",
        description="Kullanıcının şifresini değiştirir",
    )
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        # Check old password
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': 'Mevcut şifre yanlış.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response(
            {'message': 'Şifre başarıyla değiştirildi.'},
            status=status.HTTP_200_OK
        )


class UserPreferenceView(generics.RetrieveUpdateAPIView):
    """
    Get and update user preferences
    """
    serializer_class = UpdatePreferencesSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_object(self):
        preference, created = UserPreference.objects.get_or_create(
            user=self.request.user
        )
        return preference
    
    @extend_schema(
        summary="Kullanıcı Tercihleri",
        description="Kullanıcının tercihlerini döndürür",
    )
    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = UserPreferenceSerializer(instance)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Tercihleri Güncelle",
        description="Kullanıcı tercihlerini günceller",
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


class AuthorProfileViewSet(viewsets.ModelViewSet):
    """
    Author profiles viewset
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = AuthorProfile.objects.filter(
        user__is_active=True
    ).select_related('user')
    serializer_class = AuthorProfileSerializer
    pagination_class = SmallResultsSetPagination
    lookup_field = 'slug'
    
    def update(self, request, *args, **kwargs):
        # Sadece kendi profilini güncelleyebilsin
        instance = self.get_object()
        if instance.user != request.user and not request.user.is_superuser:
             return Response(
                 {"detail": "Sadece kendi profilinizi düzenleyebilirsiniz."}, 
                 status=status.HTTP_403_FORBIDDEN
             )
        return super().update(request, *args, **kwargs)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AuthorProfileMinimalSerializer
        return AuthorProfileSerializer
    
    @extend_schema(
        summary="Yazar Listesi",
        description="Tüm yazarların listesini döndürür",
        parameters=[
            OpenApiParameter('search', str, description='Yazar adında arama'),
            OpenApiParameter('featured', bool, description='Sadece öne çıkan yazarlar'),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        summary="Yazar Detayı",
        description="Belirli bir yazarın detaylı bilgilerini döndürür",
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(display_name__icontains=search) |
                Q(user__username__icontains=search) |
                Q(specialty__icontains=search)
            )
        
        return queryset.order_by('-total_articles')
    
    @action(detail=True, methods=['get'])
    @extend_schema(
        summary="Yazarın Makaleleri",
        description="Belirli bir yazarın tüm makalelerini döndürür",
    )
    def articles(self, request, slug=None):
        """Get articles by this author"""
        author = self.get_object()
        from apps.articles.models import Article
        from apps.articles.serializers import ArticleListSerializer
        
        articles = Article.objects.filter(
            author=author,
            status='published'
        ).select_related('category', 'author').prefetch_related('tags')
        
        page = self.paginate_queryset(articles)
        if page is not None:
            serializer = ArticleListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ArticleListSerializer(articles, many=True)
        return Response(serializer.data)


# Two-Factor Authentication Views
class TwoFactorSetupView(generics.GenericAPIView):
    """
    İki faktörlü kimlik doğrulama kurulum endpoint'i
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TwoFactorSetupSerializer

    @extend_schema(
        summary="2FA Kurulum",
        description="İki faktörlü kimlik doğrulama için QR kod ve yedek kodlar oluşturur",
    )
    def post(self, request):
        from apps.accounts.two_factor import (
            generate_totp_secret,
            generate_backup_codes,
            get_totp_uri,
            generate_qr_code
        )

        user = request.user

        # Check if 2FA is already enabled
        if user.two_factor_enabled:
            return Response(
                {'error': 'İki faktörlü kimlik doğrulama zaten aktif'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate secret and backup codes
        secret = generate_totp_secret()
        backup_codes = generate_backup_codes(10)

        # Temporarily store in session (not saved to DB yet)
        request.session['temp_2fa_secret'] = secret
        request.session['temp_2fa_backup_codes'] = backup_codes

        # Generate QR code
        uri = get_totp_uri(user, secret)
        qr_code = generate_qr_code(uri)

        return Response({
            'secret': secret,
            'qr_code': qr_code,
            'backup_codes': backup_codes,
            'message': 'QR kodu tarayıcınıza okutun ve doğrulama kodunu girin'
        })


class TwoFactorVerifyView(generics.GenericAPIView):
    """
    2FA kurulumu doğrulama endpoint'i
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TwoFactorVerifySerializer

    @extend_schema(
        summary="2FA Doğrulama",
        description="Authenticator app'den gelen kodu doğrulayarak 2FA'yı aktifleştirir",
    )
    def post(self, request):
        from apps.accounts.two_factor import verify_totp_code

        user = request.user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data['code']

        # Get temporary secret from session
        secret = request.session.get('temp_2fa_secret')
        backup_codes = request.session.get('temp_2fa_backup_codes')

        if not secret or not backup_codes:
            return Response(
                {'error': 'Önce kurulum adımını tamamlayın'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify code
        if not verify_totp_code(secret, code):
            return Response(
                {'error': 'Geçersiz doğrulama kodu'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save to user
        user.totp_secret = secret
        user.backup_codes = backup_codes
        user.two_factor_enabled = True
        user.save()

        # Clear session
        del request.session['temp_2fa_secret']
        del request.session['temp_2fa_backup_codes']

        return Response({
            'message': 'İki faktörlü kimlik doğrulama başarıyla aktifleştirildi',
            'two_factor_enabled': True
        })


class TwoFactorDisableView(generics.GenericAPIView):
    """
    2FA devre dışı bırakma endpoint'i
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TwoFactorDisableSerializer

    @extend_schema(
        summary="2FA Devre Dışı Bırak",
        description="İki faktörlü kimlik doğrulamayı devre dışı bırakır",
    )
    def post(self, request):
        from apps.accounts.two_factor import verify_totp_code

        user = request.user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        password = serializer.validated_data['password']
        code = serializer.validated_data['code']

        # Check if 2FA is enabled
        if not user.two_factor_enabled:
            return Response(
                {'error': 'İki faktörlü kimlik doğrulama zaten kapalı'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify password
        if not user.check_password(password):
            return Response(
                {'error': 'Geçersiz şifre'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify TOTP code
        if not verify_totp_code(user.totp_secret, code):
            return Response(
                {'error': 'Geçersiz doğrulama kodu'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Disable 2FA
        user.two_factor_enabled = False
        user.totp_secret = ''
        user.backup_codes = []
        user.save()

        return Response({
            'message': 'İki faktörlü kimlik doğrulama devre dışı bırakıldı',
            'two_factor_enabled': False
        })


class TwoFactorStatusView(generics.GenericAPIView):
    """
    2FA durumu kontrol endpoint'i
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="2FA Durumu",
        description="Kullanıcının 2FA durumunu kontrol eder",
    )
    def get(self, request):
        user = request.user
        return Response({
            'two_factor_enabled': user.two_factor_enabled,
            'backup_codes_remaining': len(user.backup_codes) if user.two_factor_enabled else 0
        })
