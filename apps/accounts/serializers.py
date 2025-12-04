from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import AuthorProfile, UserPreference, UserPreferredCategory
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


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
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Yanıta kullanıcı objesini de ekleyelim
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'user_type': self.user.user_type, # Burası kritik! Guard buraya bakıyor.
            'avatar': self.user.avatar.url if self.user.avatar else None,
            'is_verified': self.user.is_verified
        }
        
        return data