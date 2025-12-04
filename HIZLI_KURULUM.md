# 🚀 HIZLI KURULUM REHBERİ

## ⚡ Adım Adım Kurulum

### 1. Proje Dosyalarını Güncelleyin
```bash
# Mevcut backend klasörünüzü yedekleyin
cp -r /path/to/news_backend /path/to/news_backend_backup

# Yeni dosyaları kopyalayın (sağlanan dosyalardan)
# apps/, config/, utils/ klasörlerini projenize ekleyin
```

### 2. Virtual Environment (Opsiyonel ama önerilen)
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# veya
venv\Scripts\activate  # Windows
```

### 3. Bağımlılıkları Yükleyin
```bash
pip install -r requirements.txt

# Önemli: beautifulsoup4, bleach ve user-agents zaten requirements.txt'de mevcut
```

### 4. Environment Variables (.env)
`.env` dosyanızı güncelleyin veya oluşturun:

```env
# Database
DATABASE_URL=mysql://username:password@localhost:3306/news_db

# Security
SECRET_KEY=your-secret-key-here
DEBUG=True  # Production'da False yapın

# CORS
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Cache & Celery
REDIS_URL=redis://127.0.0.1:6379/0
CELERY_BROKER_URL=redis://127.0.0.1:6379/1

# Email (Opsiyonel)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-password

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 5. Database Setup
```bash
# Migration dosyalarını oluştur
python manage.py makemigrations

# Özel olarak yeni app'ler için
python manage.py makemigrations advertisements
python manage.py makemigrations bookmarks
python manage.py makemigrations articles  # Video alanları için

# Tüm migration'ları çalıştır
python manage.py migrate

# Superuser oluştur
python manage.py createsuperuser
```

### 6. Static Files
```bash
python manage.py collectstatic --noinput
```

### 7. Test Verisi (Opsiyonel)
```bash
# Örnek reklam bölgeleri oluştur
python manage.py shell

>>> from apps.advertisements.models import AdvertisementZone
>>> 
>>> zones = [
...     {'name': 'Anasayfa Üst Banner', 'zone_type': 'banner_top', 'width': 970, 'height': 250},
...     {'name': 'Sidebar Üst', 'zone_type': 'sidebar_top', 'width': 300, 'height': 250},
...     {'name': 'Makale İçi', 'zone_type': 'in_article_middle', 'width': 728, 'height': 90},
... ]
>>> 
>>> for zone_data in zones:
...     AdvertisementZone.objects.create(**zone_data)
```

### 8. Sunucuyu Başlat
```bash
# Development
python manage.py runserver

# Production (Gunicorn ile)
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

### 9. Celery & Redis (Arka plan görevleri için)
```bash
# Terminal 1: Redis başlat
redis-server

# Terminal 2: Celery worker
celery -A config worker -l info

# Terminal 3: Celery beat (Scheduled tasks)
celery -A config beat -l info

# Terminal 4: Flower (Monitoring)
celery -A config flower
```

---

## ✅ Kontrol Listesi

### Backend Kontrolü
- [ ] Sunucu başarıyla çalışıyor (`python manage.py runserver`)
- [ ] Admin panel açılıyor (`http://localhost:8000/admin/`)
- [ ] API dokümantasyonu erişilebilir (`http://localhost:8000/api/docs/`)
- [ ] Yeni app'ler admin'de görünüyor
  - [ ] Reklam Yönetimi
  - [ ] Bookmark ve Okuma Listeleri

### Yeni Endpoint Kontrolü
Test için curl veya Postman kullanın:

```bash
# Sitemap
curl http://localhost:8000/sitemap.xml

# RSS Feed
curl http://localhost:8000/rss/

# Robots.txt
curl http://localhost:8000/robots.txt

# Reklam bölgeleri
curl http://localhost:8000/api/v1/advertisements/zones/

# Bookmarks (Authenticated)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/v1/bookmarks/folders/
```

---

## 🔍 Sorun Giderme

### Migration Hataları
```bash
# Migration'ları sıfırla (DİKKAT: Verileri siler!)
python manage.py migrate advertisements zero
python manage.py migrate bookmarks zero
python manage.py migrate

# Veya fresh start
python manage.py migrate --run-syncdb
```

### Import Hataları
```bash
# Python path kontrol
python manage.py shell
>>> import apps.advertisements.models
>>> import apps.bookmarks.models
>>> import utils.helpers

# Sorun varsa:
export PYTHONPATH="${PYTHONPATH}:/path/to/project"
```

### Redis Bağlantı Hatası
```bash
# Redis çalışıyor mu kontrol et
redis-cli ping
# PONG döndürmeli

# Yoksa başlat
redis-server

# veya Docker ile
docker run -d -p 6379:6379 redis
```

### Database Bağlantı Hatası
```bash
# MySQL servisini kontrol et
sudo systemctl status mysql  # Linux
# veya
brew services list  # Mac

# MySQL kullanıcı ve database oluştur
mysql -u root -p
CREATE DATABASE news_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'newsuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON news_db.* TO 'newsuser'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📊 İlk Veri Girişi

### 1. Admin Panel'den Reklam Ekle

1. `http://localhost:8000/admin/` giriş yapın
2. **Reklam Yönetimi** > **Reklam Bölgeleri** > Yeni bölge ekle
3. **Reklamverenler** > Yeni reklamveren ekle
4. **Kampanyalar** > Yeni kampanya oluştur
5. **Reklamlar** > Kampanyaya reklam ekle

### 2. Test Bookmark

Python shell ile:
```python
python manage.py shell

>>> from apps.bookmarks.models import BookmarkFolder, Bookmark
>>> from apps.articles.models import Article
>>> from django.contrib.auth import get_user_model
>>> 
>>> User = get_user_model()
>>> user = User.objects.first()  # Veya create_user()
>>> 
>>> folder = BookmarkFolder.objects.create(
...     user=user,
...     name='Favoriler',
...     color='#FF5722'
... )
>>> 
>>> article = Article.objects.first()
>>> bookmark = Bookmark.objects.create(
...     user=user,
...     article=article,
...     folder=folder,
...     note='Önemli haber'
... )
```

### 3. Test Video Haber

```python
>>> article = Article.objects.get(slug='your-article-slug')
>>> article.has_video = True
>>> article.video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
>>> article.save()
```

---

## 🚀 Production'a Geçiş

### 1. Environment Variables
```env
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. Security Settings
`config/settings.py` dosyası zaten production ayarlarını içeriyor:
- SSL redirect
- Secure cookies
- HSTS
- XSS protection

### 3. Static Files
```bash
# WhiteNoise kullanılıyor, collectstatic yeterli
python manage.py collectstatic --noinput
```

### 4. Gunicorn
```bash
# Gunicorn ile çalıştır
gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --threads 2 \
    --timeout 60 \
    --access-logfile - \
    --error-logfile -
```

### 5. Nginx (Reverse Proxy)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /path/to/staticfiles/;
    }

    location /media/ {
        alias /path/to/media/;
    }
}
```

### 6. Systemd Service
`/etc/systemd/system/news_backend.service`:
```ini
[Unit]
Description=News Backend Gunicorn
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/news_backend
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/gunicorn \
    --workers 4 \
    --bind unix:/path/to/news_backend.sock \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl start news_backend
sudo systemctl enable news_backend
```

---

## 📚 Daha Fazla Bilgi

- [GELİŞTİRMELER.md](./GELİŞTİRMELER.md) - Detaylı özellikler
- [API_TESTING.md](./API_TESTING.md) - API test örnekleri (mevcut)
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment rehberi (mevcut)
- API Docs: `http://localhost:8000/api/docs/`

---

## 🆘 Yardım

Sorun yaşarsanız:

1. **Log dosyalarını kontrol edin:**
   ```bash
   tail -f logs/django.log
   ```

2. **Django shell'de test edin:**
   ```bash
   python manage.py shell
   >>> from apps.advertisements.models import *
   >>> # Test kodları...
   ```

3. **Migration durumunu kontrol edin:**
   ```bash
   python manage.py showmigrations
   ```

4. **Database bağlantısını test edin:**
   ```bash
   python manage.py dbshell
   ```

---

**Kurulum tamamlandı! Backend hazır 🎉**
