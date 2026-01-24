# Windows Local Development Setup

## 🚀 Hızlı Başlangıç (Development Mode)

### 1. Python Sanal Ortamı

```powershell
# PowerShell'de
python -m venv venv
.\venv\Scripts\Activate.ps1

# Bağımlılıkları yükle
pip install -r requirements.txt
```

### 2. Environment Değişkenleri

`.env` dosyası oluştur (kök dizinde):

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite - development için)
DATABASE_URL=sqlite:///db.sqlite3

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000

# Email (Console Backend - development için)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Redis (OPSIYONEL - local development için)
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# Channels (In-Memory - Redis olmadan)
CHANNEL_LAYERS_BACKEND=channels.layers.InMemoryChannelLayer
```

### 3. Database Migrate

```powershell
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 4. Backend Çalıştırma

**Seçenek A: Redis OLMADAN (Basit)**

```powershell
# Terminal 1: Django + WebSocket (Daphne)
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

**Seçenek B: Redis İLE (Tam Özellikler)**

```powershell
# Terminal 1: Redis (Windows için Redis-x64-3.0.504.msi indir)
# https://github.com/microsoftarchive/redis/releases
redis-server

# Terminal 2: Django + WebSocket (Daphne)
daphne -b 0.0.0.0 -p 8000 config.asgi:application

# Terminal 3: Celery Worker
celery -A config worker -l info -P solo

# Terminal 4: Celery Beat (Scheduled tasks)
celery -A config beat -l info
```

### 5. Frontend Çalıştırma

```powershell
cd frontend
npm install
npm start
```

Frontend: http://localhost:4200
Backend: http://localhost:8000
Admin: http://localhost:8000/admin

---

## 📝 Redis Kurulumu (Windows)

### Yöntem 1: WSL (Önerilen)

```powershell
# WSL yükle
wsl --install

# WSL içinde
sudo apt update
sudo apt install redis-server
redis-server
```

### Yöntem 2: Windows Native

1. İndir: https://github.com/microsoftarchive/redis/releases
2. `Redis-x64-3.0.504.msi` indir ve yükle
3. Çalıştır:
```powershell
redis-server
```

### Yöntem 3: Docker (En Kolay)

```powershell
# Docker Desktop yükle, sonra:
docker run -d -p 6379:6379 redis:latest
```

### Yöntem 4: Redis OLMADAN Çalıştır

Settings'te şunu kullan:

```python
# config/settings.py
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
    }
}
```

---

## 🔧 Troubleshooting

### WebSocket 404 Hatası

**Sorun**: `/ws/breaking-news/` 404 veriyor

**Çözüm**: `runserver` yerine `daphne` kullan!

```powershell
# YANLIŞ (WebSocket çalışmaz)
python manage.py runserver

# DOĞRU (WebSocket çalışır)
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

### Registration 401 Hatası

**Sorun**: Kayıt sırasında 401 Unauthorized

**Çözüm**: CORS ayarlarını kontrol et

```python
# config/settings.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:4200',  # Angular
    'http://localhost:3000',  # React
]
```

### Google OAuth 403 Hatası

**Sorun**: Google ile giriş yaparken 403

**Çözüm**:
1. Google Cloud Console'dan OAuth Client ID al
2. Frontend environment'a ekle:

```typescript
// frontend/src/environments/environment.ts
export const environment = {
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID_HERE',
};
```

3. Admin panelinde Social App ekle:
   - http://localhost:8000/admin/socialaccount/socialapp/

---

## 📊 Development Komutları

```powershell
# Database sıfırla
python manage.py flush

# Migrations sıfırla
python manage.py migrate --fake-initial

# Test data oluştur
python manage.py shell
>>> from apps.articles.tests import create_test_data
>>> create_test_data()

# Celery task test
python manage.py shell
>>> from apps.articles.tasks import update_trending_articles
>>> update_trending_articles.delay()

# Redis test
redis-cli ping
# PONG dönmeli
```

---

## 🚀 Production (IIS) - Gelecek için

**Not**: Production'da IIS kullanacaksan:

1. **wfastcgi** (HTTP + Django)
2. **nginx + daphne** (WebSocket + HTTP)

Şimdilik development için yukarıdaki komutları kullan!

---

## 📋 Gerekli Paketler

```
daphne>=4.0.0
channels>=4.0.0
channels-redis>=4.1.0  # Redis kullanıyorsan
celery>=5.3.0          # Background tasks için
redis>=5.0.0           # Redis kullanıyorsan
```

Hepsi `requirements.txt`'de olmalı.

---

## ✅ Kontrol Listesi

- [ ] Python venv aktif
- [ ] `.env` dosyası oluşturuldu
- [ ] Database migrate yapıldı
- [ ] Superuser oluşturuldu
- [ ] Redis çalışıyor (opsiyonel)
- [ ] Daphne ile backend çalışıyor
- [ ] Frontend çalışıyor
- [ ] WebSocket bağlantısı başarılı
- [ ] Registration çalışıyor
- [ ] Google OAuth yapılandırıldı (opsiyonel)
