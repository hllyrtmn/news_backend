from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import AuthorProfile, UserPreference, UserPreferredCategory
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from dj_rest_auth.registration.serializers import RegisterSerializer
from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email

User = get_user_model()


class CustomRegisterSerializer(RegisterSerializer):
    """
    Custom registration serializer with email verification support.
    Used by dj-rest-auth for email verification flow.
    """
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    user_type = serializers.ChoiceField(
        choices=['reader', 'author', 'subscriber', 'premium'],
        default='reader',
        required=False
    )

    def get_cleaned_data(self):
        """Override to include custom fields"""
        data = super().get_cleaned_data()
        data['first_name'] = self.validated_data.get('first_name', '')
        data['last_name'] = self.validated_data.get('last_name', '')
        data['user_type'] = self.validated_data.get('user_type', 'reader')
        return data

    def save(self, request):
        """Override save to create user with custom fields"""
        adapter = get_adapter()
        user = adapter.new_user(request)
        self.cleaned_data = self.get_cleaned_data()
        user = adapter.save_user(request, user, self, commit=False)

        # Set custom fields
        user.first_name = self.cleaned_data.get('first_name', '')
        user.last_name = self.cleaned_data.get('last_name', '')
        user.user_type = self.cleaned_data.get('user_type', 'reader')
        user.save()

        # Setup email verification
        setup_user_email(request, user, [])

        # Create user preferences
        UserPreference.objects.get_or_create(user=user)

        return user


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name','user_type'
        )
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Şifreler eşleşmiyor."}
            )
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        
        # Create user preference
        UserPreference.objects.create(user=user)
        
        return user


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'avatar', 'bio', 'phone', 'birth_date',
            'user_type', 'is_verified', 'date_joined'
        )
        read_only_fields = ('id', 'user_type', 'is_verified', 'date_joined')


class UserProfileSerializer(serializers.ModelSerializer):
    """Detailed user profile with preferences"""
    preferences = serializers.SerializerMethodField()
    author_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'avatar', 'bio', 'phone', 'birth_date', 'user_type',
            'is_verified', 'date_joined', 'preferences', 'author_profile'
        )
        read_only_fields = ('id', 'user_type', 'is_verified', 'date_joined')
    
    def get_preferences(self, obj):
        try:
            return UserPreferenceSerializer(obj.preferences).data
        except UserPreference.DoesNotExist:
            return None
    
    def get_author_profile(self, obj):
        try:
            return AuthorProfileSerializer(obj.author_profile).data
        except AuthorProfile.DoesNotExist:
            return None


class AuthorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = AuthorProfile
        fields = (
            'id', 'user', 'display_name', 'slug', 'title',
            'specialty', 'bio_long', 'social_twitter', 'social_linkedin',
            'social_instagram', 'social_facebook', 'website',
            'total_articles', 'total_views', 'average_rating',
            'is_featured', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'slug', 'total_articles', 'total_views',
            'average_rating', 'created_at', 'updated_at'
        )


class AuthorProfileMinimalSerializer(serializers.ModelSerializer):
    """Minimal author info for article listings"""
    class Meta:
        model = AuthorProfile
        fields = ('id', 'display_name', 'slug', 'title', 'user')
        depth = 1


class UserPreferredCategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    
    class Meta:
        model = UserPreferredCategory
        fields = ('id', 'category', 'category_name', 'category_slug', 'order')


class UserPreferenceSerializer(serializers.ModelSerializer):
    preferred_categories = UserPreferredCategorySerializer(many=True, read_only=True)
    
    class Meta:
        model = UserPreference
        fields = (
            'email_notifications', 'push_notifications',
            'newsletter_subscribed', 'language', 'theme',
            'font_size', 'preferred_categories'
        )


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password]
    )
    new_password2 = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError(
                {"new_password": "Yeni şifreler eşleşmiyor."}
            )
        return attrs


class UpdatePreferencesSerializer(serializers.ModelSerializer):
    preferred_category_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = UserPreference
        fields = (
            'email_notifications', 'push_notifications',
            'newsletter_subscribed', 'language', 'theme',
            'font_size', 'preferred_category_ids'
        )
    
    def update(self, instance, validated_data):
        category_ids = validated_data.pop('preferred_category_ids', None)
        
        # Update preferences
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update preferred categories
        if category_ids is not None:
            from apps.categories.models import Category
            
            # Clear existing
            instance.preferred_categories.all().delete()
            
            # Add new ones
            for order, cat_id in enumerate(category_ids):
                try:
                    category = Category.objects.get(id=cat_id)
                    UserPreferredCategory.objects.create(
                        preference=instance,
                        category=category,
                        order=order
                    )
                except Category.DoesNotExist:
                    pass
        
        return instance

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    totp_code = serializers.CharField(max_length=6, required=False, write_only=True)

    def validate(self, attrs):
        # Remove TOTP code from attrs before super().validate()
        totp_code = attrs.pop('totp_code', None)

        data = super().validate(attrs)

        # Check if user has 2FA enabled
        if self.user.two_factor_enabled:
            if not totp_code:
                raise serializers.ValidationError({
                    'totp_code': 'İki faktörlü kimlik doğrulama kodu gerekli',
                    'requires_2fa': True
                })

            # Verify TOTP code
            from apps.accounts.two_factor import verify_totp_code, verify_backup_code

            # Try TOTP code first
            if not verify_totp_code(self.user.totp_secret, totp_code):
                # Try backup code
                if not verify_backup_code(self.user, totp_code):
                    raise serializers.ValidationError({
                        'totp_code': 'Geçersiz doğrulama kodu'
                    })

        # Yanıta kullanıcı objesini de ekleyelim
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'user_type': self.user.user_type,
            'avatar': self.user.avatar.url if self.user.avatar else None,
            'is_verified': self.user.is_verified,
            'two_factor_enabled': self.user.two_factor_enabled
        }

        return data


class TwoFactorSetupSerializer(serializers.Serializer):
    """Serializer for 2FA setup response"""
    secret = serializers.CharField(read_only=True)
    qr_code = serializers.CharField(read_only=True)
    backup_codes = serializers.ListField(child=serializers.CharField(), read_only=True)


class TwoFactorVerifySerializer(serializers.Serializer):
    """Serializer for verifying 2FA code during setup"""
    code = serializers.CharField(max_length=6, required=True)


class TwoFactorDisableSerializer(serializers.Serializer):
    """Serializer for disabling 2FA"""
    password = serializers.CharField(required=True, write_only=True)
    code = serializers.CharField(max_length=6, required=True)