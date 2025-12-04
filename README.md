# 📰 Haber Sitesi Backend - Django REST Framework

Kapsamlı ve profesyonel bir haber sitesi backend'i. Django REST Framework ile geliştirilmiştir.

## 🚀 Özellikler

### Kullanıcı Yönetimi
- ✅ Özel kullanıcı modeli (CustomUser)
- ✅ JWT authentication
- ✅ Yazar profilleri ve detaylı biyografiler
- ✅ Kullanıcı tercihleri ve kişiselleştirme
- ✅ Rol tabanlı yetkilendirme (admin, editor, author, subscriber, reader)

### İçerik Yönetimi
- ✅ Haber/Makale sistemi (draft, pending, published, archived)
- ✅ Hiyerarşik kategori yapısı
- ✅ Etiket sistemi
- ✅ Öne çıkan, son dakika, gündem haberleri
- ✅ Haber revizyonları ve versiyon kontrolü
- ✅ İlgili haberler sistemi
- ✅ Rich text editor (CKEditor)

### Medya Yönetimi
- ✅ Görsel, video, ses, doküman yönetimi
- ✅ Otomatik thumbnail oluşturma
- ✅ Galeri desteği
- ✅ Medya metadata yönetimi

### Etkileşim Özellikleri
- ✅ Yorum sistemi (iç içe yorumlar)
- ✅ Yorum onay/moderasyon
- ✅ Bookmark (kaydetme) sistemi
- ✅ Haber puanlama sistemi
- ✅ Okuma geçmişi takibi

### Analitik & Raporlama
- ✅ Detaylı görüntülenme analizi
- ✅ Popüler haberler hesaplama
- ✅ Sosyal medya paylaşım takibi
- ✅ Kullanıcı davranış analizi
- ✅ Dashboard istatistikleri

### Performans & Cache
- ✅ Redis cache entegrasyonu
- ✅ Akıllı cache invalidation
- ✅ Celery async task queue
- ✅ Celery beat scheduled tasks
- ✅ Query optimization (select_related, prefetch_related)

### API Özellikleri
- ✅ RESTful API design
- ✅ Swagger/OpenAPI documentation (drf-spectacular)
- ✅ Filtering, searching, ordering
- ✅ Pagination
- ✅ Rate limiting
- ✅ Custom exception handling

### SEO & Social
- ✅ Meta tags yönetimi
- ✅ Open Graph desteği
- ✅ Sitemap
- ✅ RSS Feed
- ✅ Structured data (JSON-LD)

### Ek Özellikler
- ✅ Newsletter sistemi
- ✅ İletişim formu
- ✅ İçerik şikayet sistemi
- ✅ Site ayarları yönetimi
- ✅ Email notifications
- ✅ Multi-language support hazırlığı

## 📋 Gereksinimler

- Python 3.10+
- PostgreSQL 13+
- Redis 6+
- (Opsiyonel) Celery için message broker

## 🔧 Kurulum

### 1. Repository'yi klonlayın
```bash
git clone <repository-url>
cd news_backend
```

### 2. Virtual environment oluşturun
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# veya
venv\Scripts\activate  # Windows
```

### 3. Bağımlılıkları yükleyin
```bash
pip install -r requirements.txt
```

### 4. Ortam değişkenlerini ayarlayın
```bash
cp .env.example .env
# .env dosyasını düzenleyin ve gerekli bilgileri girin
```

### 5. PostgreSQL veritabanını oluşturun
```bash
createdb news_db
```

### 6. Redis'i başlatın
```bash
redis-server
```

### 7. Migrations'ları çalıştırın
```bash
python manage.py makemigrations
python manage.py migrate
```

### 8. Superuser oluşturun
```bash
python manage.py createsuperuser
```

### 9. Static dosyaları toplayın
```bash
python manage.py collectstatic --no-input
```

### 10. Development server'ı başlatın
```bash
python manage.py runserver
```

## 🚀 Celery Çalıştırma

### Celery Worker
```bash
celery -A config worker -l info
```

### Celery Beat (Scheduled Tasks)
```bash
celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

### Flower (Monitoring)
```bash
celery -A config flower
```

## 📚 API Dokümantasyonu

API dokümantasyonuna şu URL'lerden erişebilirsiniz:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

## 🗂️ Proje Yapısı

```
news_backend/
├── config/                 # Django settings ve yapılandırma
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   ├── asgi.py
│   └── celery.py
├── apps/
│   ├── accounts/          # Kullanıcı yönetimi
│   ├── articles/          # Haber/makale sistemi
│   ├── categories/        # Kategori yönetimi
│   ├── tags/             # Etiket sistemi
│   ├── media_app/        # Medya yönetimi
│   ├── comments/         # Yorum sistemi
│   ├── interactions/     # Bookmark, rating, history
│   ├── core/            # Site ayarları, iletişim
│   ├── newsletter/      # Newsletter sistemi
│   └── analytics/       # Analitik ve raporlama
├── utils/               # Yardımcı fonksiyonlar
│   ├── permissions.py
│   ├── pagination.py
│   ├── cache_utils.py
│   ├── helpers.py
│   └── exception_handler.py
├── requirements.txt
├── manage.py
└── README.md
```

## 🔐 API Endpoints

### Authentication
```
POST   /api/v1/auth/register/          # Kayıt ol
POST   /api/v1/auth/login/             # Giriş yap
POST   /api/v1/auth/token/refresh/     # Token yenile
GET    /api/v1/auth/profile/           # Profil bilgisi
PATCH  /api/v1/auth/profile/           # Profil güncelle
POST   /api/v1/auth/change-password/   # Şifre değiştir
GET    /api/v1/auth/preferences/       # Tercihler
PATCH  /api/v1/auth/preferences/       # Tercih güncelle
```

### Articles
```
GET    /api/v1/articles/               # Haber listesi
GET    /api/v1/articles/{slug}/        # Haber detayı
POST   /api/v1/articles/               # Haber oluştur
PATCH  /api/v1/articles/{slug}/        # Haber güncelle
DELETE /api/v1/articles/{slug}/        # Haber sil
GET    /api/v1/articles/featured/      # Öne çıkan haberler
GET    /api/v1/articles/breaking/      # Son dakika haberleri
GET    /api/v1/articles/popular/       # Popüler haberler
```

### Categories
```
GET    /api/v1/categories/             # Kategori listesi
GET    /api/v1/categories/{slug}/      # Kategori detayı
GET    /api/v1/categories/tree/        # Kategori ağacı
GET    /api/v1/categories/{slug}/articles/  # Kategorinin haberleri
```

### Tags
```
GET    /api/v1/tags/                   # Etiket listesi
GET    /api/v1/tags/trending/          # Popüler etiketler
GET    /api/v1/tags/{slug}/articles/   # Etiketin haberleri
```

### Comments
```
GET    /api/v1/comments/               # Yorum listesi
POST   /api/v1/comments/               # Yorum yap
PATCH  /api/v1/comments/{id}/          # Yorum güncelle
DELETE /api/v1/comments/{id}/          # Yorum sil
POST   /api/v1/comments/{id}/like/     # Yorum beğen
```

### Interactions
```
GET    /api/v1/interactions/bookmarks/ # Kayıtlı haberler
POST   /api/v1/interactions/bookmarks/ # Haber kaydet
GET    /api/v1/interactions/ratings/   # Puanlarım
POST   /api/v1/interactions/ratings/   # Puan ver
GET    /api/v1/interactions/history/   # Okuma geçmişi
```

### Analytics
```
GET    /api/v1/analytics/dashboard/    # Dashboard istatistikleri
```

## ⚙️ Önemli Ayarlar

### Cache Süreleri (settings.py)
```python
CACHE_TTL = {
    'ARTICLE_LIST': 300,      # 5 dakika
    'ARTICLE_DETAIL': 900,    # 15 dakika
    'CATEGORY_LIST': 1800,    # 30 dakika
    'POPULAR_ARTICLES': 600,  # 10 dakika
}
```

### Celery Beat Schedule
```python
CELERY_BEAT_SCHEDULE = {
    'update-popular-articles': {
        'task': 'apps.analytics.tasks.update_popular_articles',
        'schedule': crontab(minute='*/30'),  # Her 30 dakika
    },
    'cleanup-old-views': {
        'task': 'apps.analytics.tasks.cleanup_old_views',
        'schedule': crontab(hour=2, minute=0),  # Her gece 02:00
    },
}
```

## 🔒 Güvenlik

- HTTPS zorunlu (production)
- CORS yapılandırması
- Rate limiting
- SQL injection koruması
- XSS koruması
- CSRF koruması
- JWT token rotation
- Password validation
- Content sanitization

## 📊 Performans İpuçları

1. **Database İndexleme**: Sık sorgulanan alanlar için index kullanın
2. **Query Optimization**: select_related ve prefetch_related kullanın
3. **Cache Stratejisi**: Redis cache'i aktif kullanın
4. **CDN**: Static ve media dosyaları için CDN kullanın
5. **Database Connection Pooling**: PgBouncer gibi araçlar kullanın
6. **Async Tasks**: Ağır işlemler için Celery kullanın

## 🐛 Debugging

```bash
# Django Debug Toolbar
http://localhost:8000/__debug__/

# Silk (Performance profiling)
http://localhost:8000/silk/

# Flower (Celery monitoring)
http://localhost:5555/
```

## 🧪 Testing

```bash
# Tüm testleri çalıştır
pytest

# Coverage report
pytest --cov=apps --cov-report=html
```

## 📝 Deployment

### Production Checklist
- [ ] DEBUG=False
- [ ] SECRET_KEY güvenli ve unique
- [ ] ALLOWED_HOSTS ayarlandı
- [ ] HTTPS aktif
- [ ] PostgreSQL production ayarları
- [ ] Redis production ayarları
- [ ] Static/Media files CDN'de
- [ ] Celery worker çalışıyor
- [ ] Celery beat çalışıyor
- [ ] Gunicorn/uWSGI ile serve
- [ ] Nginx reverse proxy
- [ ] SSL sertifikası
- [ ] Backup stratejisi
- [ ] Monitoring (Sentry)
- [ ] Log rotation

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altındadır.

## 📞 İletişim

Sorularınız için: [email@example.com]

---

**Developed with ❤️ using Django REST Framework**
