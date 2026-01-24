import os
from pathlib import Path
from datetime import timedelta
from decouple import config, Csv
import dj_database_url

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Security Settings
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    
    # Third party apps
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'ckeditor',
    'ckeditor_uploader',
    'easy_thumbnails',
    'versatileimagefield',
    'drf_spectacular',
    'drf_spectacular_sidecar',
    'django_celery_beat',
    'channels',  # Django Channels for WebSocket
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.facebook',
    'allauth.socialaccount.providers.twitter',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    
    # Debug (only in development)
    'debug_toolbar',
    'django_extensions',
    'silk',
    
    # Local apps
    'apps.accounts',
    'apps.articles',
    'apps.categories',
    'apps.tags',
    'apps.media_app',
    'apps.comments',
    'apps.interactions',
    'apps.core',
    'apps.newsletter',
    'apps.analytics',
    'apps.advertisements',  # Yeni: Reklam sistemi
    'apps.bookmarks',  # Yeni: Bookmark ve okuma listeleri
    'apps.notifications',  # Yeni: Bildirim sistemi
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    'silk.middleware.SilkyMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_COOKIE': 'jwt-auth',
    'JWT_AUTH_REFRESH_COOKIE': 'jwt-refresh',
    'JWT_AUTH_HTTPONLY': False,
    'REGISTER_SERIALIZER': 'apps.accounts.serializers.CustomRegisterSerializer',
}

# Django Allauth Settings
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = 'optional'  # Development için optional (production'da 'mandatory' yap)
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_CONFIRM_EMAIL_ON_GET = True
ACCOUNT_EMAIL_CONFIRMATION_EXPIRE_DAYS = 3
ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = True

# Social Auth Settings
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_EMAIL_VERIFICATION = 'none'  # Social auth'ta e-posta doğrulama gerekmesin
SOCIALACCOUNT_QUERY_EMAIL = True

# Social Account Providers Configuration
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        },
        'APP': {
            'client_id': config('GOOGLE_OAUTH_CLIENT_ID', default=''),
            'secret': config('GOOGLE_OAUTH_SECRET', default=''),
            'key': ''
        }
    },
    'facebook': {
        'METHOD': 'oauth2',
        'SCOPE': ['email', 'public_profile'],
        'AUTH_PARAMS': {'auth_type': 'reauthenticate'},
        'INIT_PARAMS': {'cookie': True},
        'FIELDS': [
            'id',
            'first_name',
            'last_name',
            'middle_name',
            'name',
            'name_format',
            'picture',
            'short_name',
            'email',
        ],
        'EXCHANGE_TOKEN': True,
        'VERIFIED_EMAIL': False,
        'VERSION': 'v13.0',
        'APP': {
            'client_id': config('FACEBOOK_APP_ID', default=''),
            'secret': config('FACEBOOK_APP_SECRET', default=''),
            'key': ''
        }
    },
    'twitter': {
        'APP': {
            'client_id': config('TWITTER_API_KEY', default=''),
            'secret': config('TWITTER_API_SECRET', default=''),
            'key': ''
        }
    }
}

# Database
DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL', default='postgresql://postgres:postgres@localhost:5432/news_db'),
        conn_max_age=600,  # Connection persistent for 10 minutes
        conn_health_checks=True,  # Check connection health before reusing
    )
}

# Database connection pool optimization for high traffic
# These settings are applied when using PostgreSQL
if 'postgresql' in DATABASES['default']['ENGINE'] or 'psycopg2' in DATABASES['default']['ENGINE']:
    DATABASES['default']['OPTIONS'] = {
        'connect_timeout': 10,  # Connection timeout in seconds
        'options': '-c statement_timeout=30000',  # Query timeout: 30 seconds
    }

# Database pool size (for production with connection pooling like PgBouncer)
# Adjust based on your server resources:
# Formula: (CPU cores * 2) + effective_spindle_count
# For 4 cores: (4 * 2) + 1 = 9, but we set higher for web servers
DATABASE_POOL_SIZE = config('DATABASE_POOL_SIZE', default=20, cast=int)
DATABASE_MAX_OVERFLOW = config('DATABASE_MAX_OVERFLOW', default=30, cast=int)

# Custom User Model
AUTH_USER_MODEL = 'accounts.CustomUser'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'tr-tr'
TIME_ZONE = 'Europe/Istanbul'
USE_I18N = True
USE_TZ = False

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# CKEditor
CKEDITOR_UPLOAD_PATH = 'uploads/'
CKEDITOR_IMAGE_BACKEND = 'pillow'
CKEDITOR_JQUERY_URL = 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js'
CKEDITOR_CONFIGS = {
    'default': {
        'toolbar': 'full',
        'height': 400,
        'width': '100%',
        'extraPlugins': ','.join(['codesnippet', 'widget', 'dialog']),
    },
}

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Sites Framework
SITE_ID = 1

# CORS Settings
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:3000,http://localhost:4200', cast=Csv())
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        # Anonymous users (not logged in)
        'anon': '100/hour',           # General API access

        # Authenticated users
        'user': '1000/hour',          # General API access
        'burst': '30/min',            # Short burst protection
        'sustained': '500/hour',      # Long-term limit

        # Specific endpoints
        'comment': '10/hour',         # Comment creation (prevent spam)
        'auth': '20/hour',            # Login/register attempts
        'read': '300/hour',           # Read-only endpoints (relaxed)
        'write': '50/hour',           # Write operations

        # Premium users (higher limits)
        'premium': '5000/hour',       # Premium/subscriber users

        # Admin (no limits in practice, but set high)
        'admin': '100000/hour',       # Admin/staff users
    },
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'EXCEPTION_HANDLER': 'utils.exception_handler.custom_exception_handler',
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=config('JWT_ACCESS_TOKEN_LIFETIME', default=60, cast=int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(minutes=config('JWT_REFRESH_TOKEN_LIFETIME', default=1440, cast=int)),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
}

# DRF Spectacular (API Documentation)
SPECTACULAR_SETTINGS = {
    'TITLE': 'News Backend API',
    'DESCRIPTION': 'Kapsamlı Haber Sitesi REST API',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SWAGGER_UI_DIST': 'SIDECAR',
    'SWAGGER_UI_FAVICON_HREF': 'SIDECAR',
    'REDOC_DIST': 'SIDECAR',
    'COMPONENT_SPLIT_REQUEST': True,
}

# Redis Cache Configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://127.0.0.1:6379/0'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            # 'PARSER_CLASS': 'redis.connection.HiredisParser',
            'CONNECTION_POOL_KWARGS': {'max_connections': 50},
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
            'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor',
            'IGNORE_EXCEPTIONS': True,
        },
        'KEY_PREFIX': 'news',
        'TIMEOUT': 300,
    }
}

# Cache Time Settings (seconds)
CACHE_TTL = {
    'ARTICLE_LIST': 60 * 5,  # 5 minutes
    'ARTICLE_DETAIL': 60 * 15,  # 15 minutes
    'CATEGORY_LIST': 60 * 30,  # 30 minutes
    'POPULAR_ARTICLES': 60 * 10,  # 10 minutes
    'TRENDING_TAGS': 60 * 15,  # 15 minutes
    'HOME_PAGE': 60 * 5,  # 5 minutes
}

# Celery Configuration
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://127.0.0.1:6379/1')
CELERY_RESULT_BACKEND = config('CELERY_BROKER_URL', default='redis://127.0.0.1:6379/1')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes
CELERY_TASK_SOFT_TIME_LIMIT = 25 * 60  # 25 minutes (soft limit before hard limit)

# Worker optimization for high traffic
CELERY_WORKER_PREFETCH_MULTIPLIER = 4  # Number of tasks to prefetch per worker
CELERY_WORKER_MAX_TASKS_PER_CHILD = 1000  # Restart worker after 1000 tasks (prevent memory leaks)
CELERY_WORKER_DISABLE_RATE_LIMITS = False  # Enable rate limiting if needed

# Connection pool settings for Redis
CELERY_BROKER_POOL_LIMIT = 50  # Maximum number of connections in the pool
CELERY_BROKER_CONNECTION_RETRY = True
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_BROKER_CONNECTION_MAX_RETRIES = 10

# Result backend optimization
CELERY_RESULT_EXPIRES = 3600  # Results expire after 1 hour
CELERY_RESULT_BACKEND_MAX_RETRIES = 10
CELERY_RESULT_PERSISTENT = True  # Persist results to disk

# Task execution optimization
CELERY_TASK_ACKS_LATE = True  # Acknowledge tasks after completion (safer for crashes)
CELERY_TASK_REJECT_ON_WORKER_LOST = True  # Reject tasks if worker dies
CELERY_TASK_IGNORE_RESULT = False  # Store task results

# Task routing (route heavy tasks to dedicated queues)
CELERY_TASK_ROUTES = {
    'apps.analytics.tasks.record_article_view': {'queue': 'high_priority'},  # Fast tracking
    'apps.analytics.tasks.update_popular_articles': {'queue': 'low_priority'},  # Background job
    'apps.analytics.tasks.cleanup_old_views': {'queue': 'low_priority'},
    'apps.newsletter.tasks.*': {'queue': 'low_priority'},  # Newsletter tasks
}

# Queue definitions
CELERY_TASK_DEFAULT_QUEUE = 'default'
CELERY_TASK_DEFAULT_EXCHANGE = 'default'
CELERY_TASK_DEFAULT_ROUTING_KEY = 'default'

# Performance: Use gevent pool for I/O-bound tasks (like view tracking)
# Start workers with: celery -A config worker -P gevent -c 100
# -P gevent: Use gevent pool
# -c 100: 100 concurrent greenlets (adjust based on server resources)

# Celery Beat Schedule
from celery.schedules import crontab
CELERY_BEAT_SCHEDULE = {
    'update-popular-articles': {
        'task': 'apps.analytics.tasks.update_popular_articles',
        'schedule': crontab(minute='*/30'),  # Her 30 dakikada bir
    },
    'update-trending-tags': {
        'task': 'apps.analytics.tasks.update_trending_tags',
        'schedule': crontab(minute='*/15'),  # Her 15 dakikada bir
    },
    'send-daily-newsletter': {
        'task': 'apps.newsletter.tasks.send_daily_newsletter',
        'schedule': crontab(hour=8, minute=0),  # Her gün saat 08:00
    },
    'cleanup-old-views': {
        'task': 'apps.analytics.tasks.cleanup_old_views',
        'schedule': crontab(hour=2, minute=0),  # Her gece saat 02:00
    },
}

# Email Configuration
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@example.com')

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'maxBytes': 1024 * 1024 * 10,  # 10 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Create logs directory
LOGS_DIR = BASE_DIR / 'logs'
LOGS_DIR.mkdir(exist_ok=True)

# Debug Toolbar
INTERNAL_IPS = ['127.0.0.1', 'localhost']

# Security Settings (Production)
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    X_FRAME_OPTIONS = 'DENY'

# Thumbnail Settings
THUMBNAIL_ALIASES = {
    '': {
        'small': {'size': (150, 150), 'crop': True},
        'medium': {'size': (300, 300), 'crop': True},
        'large': {'size': (800, 600), 'crop': False},
        'featured': {'size': (1200, 630), 'crop': True},
    },
}

# Custom Settings
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:3000')
ARTICLES_PER_PAGE = 20
COMMENTS_PER_PAGE = 10
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB

# Django Channels (WebSocket) Configuration
ASGI_APPLICATION = 'config.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [config('REDIS_URL', default='redis://127.0.0.1:6379/2')],
            "capacity": 1500,  # Maximum number of messages to store
            "expiry": 10,  # Message expiry time in seconds
        },
    },
}

# For development/testing without Redis
# CHANNEL_LAYERS = {
#     "default": {
#         "BACKEND": "channels.layers.InMemoryChannelLayer"
#     }
# }
