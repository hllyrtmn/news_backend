# WebSocket ve Backend Deployment Rehberi

Bu dokümantasyon, Django Channels ile WebSocket desteği dahil olmak üzere tüm backend'in production'a nasıl deploy edileceğini adım adım anlatır.

## 📋 İçindekiler

1. [Gereksinimler](#gereksinimler)
2. [Redis Kurulumu](#redis-kurulumu)
3. [Python Paketleri](#python-paketleri)
4. [Django Ayarları](#django-ayarları)
5. [Daphne (ASGI Server) Kurulumu](#daphne-asgi-server-kurulumu)
6. [Nginx Konfigürasyonu](#nginx-konfigürasyonu)
7. [Systemd Servisleri](#systemd-servisleri)
8. [SSL/HTTPS Kurulumu](#sslhttps-kurulumu)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 Gereksinimler

### Sistem Gereksinimleri
- Ubuntu 20.04+ (veya Debian-based Linux)
- Python 3.9+
- PostgreSQL 12+
- Redis 6+
- Nginx 1.18+

### Donanım Önerileri
- **Minimum**: 2 CPU, 4GB RAM, 20GB Disk
- **Önerilen**: 4 CPU, 8GB RAM, 50GB SSD

---

## 🗄️ Redis Kurulumu

### 1. Redis'i Yükle

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server -y

# Redis'i başlat ve enable et
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Redis çalışıyor mu kontrol et
sudo systemctl status redis-server
redis-cli ping  # PONG dönmeli
```

### 2. Redis Konfigürasyonu

Redis config dosyasını düzenle:
```bash
sudo nano /etc/redis/redis.conf
```

**Önemli Ayarlar:**
```conf
# Bind localhost (güvenlik için)
bind 127.0.0.1 ::1

# Memory ayarları
maxmemory 512mb
maxmemory-policy allkeys-lru

# Persistence (opsiyonel - WebSocket için gerekli değil)
save 900 1
save 300 10
save 60 10000

# Password (production'da şiddetle önerilir)
requirepass YOUR_STRONG_PASSWORD_HERE
```

Redis'i restart et:
```bash
sudo systemctl restart redis-server
```

### 3. Redis Database'leri Ayarla

Backend'de 3 farklı Redis database kullanıyoruz:
- **DB 0**: Django Cache
- **DB 1**: Celery Broker
- **DB 2**: Django Channels (WebSocket)

`.env` dosyasında:
```env
REDIS_URL=redis://:YOUR_PASSWORD@127.0.0.1:6379/0
CELERY_BROKER_URL=redis://:YOUR_PASSWORD@127.0.0.1:6379/1

# Channels için (settings.py'de otomatik kullanılacak)
# redis://127.0.0.1:6379/2
```

---

## 📦 Python Paketleri

### 1. Virtual Environment Oluştur

```bash
cd /home/user/news_backend

# Virtual environment oluştur
python3 -m venv venv

# Aktif et
source venv/bin/activate
```

### 2. Gerekli Paketleri Yükle

`requirements.txt`'e ekle (eğer yoksa):
```txt
# Existing packages...

# WebSocket Support
channels==4.0.0
channels-redis==4.1.0
daphne==4.0.0

# Video Support (opsiyonel)
moviepy==1.0.3

# 2FA Support
pyotp==2.9.0
qrcode[pil]==7.4.2

# PostgreSQL (eğer yoksa)
psycopg2-binary==2.9.10
```

Yükle:
```bash
pip install -r requirements.txt
```

---

## ⚙️ Django Ayarları

### 1. Environment Variables (.env)

`.env` dosyası oluştur:
```bash
nano .env
```

**Tam .env örneği:**
```env
# Django
SECRET_KEY=your-super-secret-key-here-change-this
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://dbuser:dbpassword@localhost:5432/news_db

# Redis
REDIS_URL=redis://:redis_password@127.0.0.1:6379/0
CELERY_BROKER_URL=redis://:redis_password@127.0.0.1:6379/1

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Social Auth
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_SECRET=your-google-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-secret
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-secret

# Frontend
FRONTEND_URL=https://yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Site
SITE_NAME=Haber Sitesi
```

### 2. Database Migration

```bash
# Migration'ları çalıştır
python manage.py migrate

# Static dosyaları topla
python manage.py collectstatic --noinput

# Superuser oluştur
python manage.py createsuperuser
```

---

## 🚀 Daphne (ASGI Server) Kurulumu

Daphne, Django Channels için ASGI server'dır (WebSocket desteği için gerekli).

### 1. Test Et (Development)

```bash
# Development modunda test et
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

Browser'da `http://your-server-ip:8000` açılmalı.

### 2. Production Konfigürasyonu

Daphne'yi Unix socket ile çalıştıracağız (Nginx ile iletişim için).

**Systemd service dosyası oluştur:**
```bash
sudo nano /etc/systemd/system/daphne.service
```

**İçerik:**
```ini
[Unit]
Description=Daphne ASGI Server for News Backend
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/home/user/news_backend
Environment="PATH=/home/user/news_backend/venv/bin"

# Unix socket ile çalıştır
ExecStart=/home/user/news_backend/venv/bin/daphne \
    -u /run/daphne/daphne.sock \
    config.asgi:application

# Restart ayarları
Restart=always
RestartSec=5

# Process management
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### 3. Socket Dizini Oluştur

```bash
# Socket dizini oluştur
sudo mkdir -p /run/daphne
sudo chown www-data:www-data /run/daphne

# Permissions
sudo chmod 755 /run/daphne
```

### 4. Servisi Başlat

```bash
# Systemd'yi reload et
sudo systemctl daemon-reload

# Daphne'yi başlat
sudo systemctl start daphne

# Enable et (otomatik başlama)
sudo systemctl enable daphne

# Status kontrol
sudo systemctl status daphne

# Log kontrol
sudo journalctl -u daphne -f
```

---

## 🌐 Nginx Konfigürasyonu

### 1. Nginx Kurulumu

```bash
sudo apt update
sudo apt install nginx -y
```

### 2. Site Konfigürasyonu

Nginx config dosyası oluştur:
```bash
sudo nano /etc/nginx/sites-available/news_backend
```

**Tam Nginx Konfigürasyonu:**
```nginx
# Upstream definitions
upstream django_backend {
    server unix:/run/daphne/daphne.sock fail_timeout=0;
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=general_api:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=strict_api:10m rate=10r/m;

# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Max upload size (video için artırıldı)
    client_max_body_size 500M;

    # Logging
    access_log /var/log/nginx/news_backend_access.log;
    error_log /var/log/nginx/news_backend_error.log;

    # Static files
    location /static/ {
        alias /home/user/news_backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /home/user/news_backend/media/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # WebSocket endpoints (ÖNEMLİ!)
    location /ws/ {
        proxy_pass http://django_backend;

        # WebSocket headers
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts (WebSocket için uzun)
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Admin panel
    location /admin/ {
        limit_req zone=strict_api burst=5 nodelay;
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API endpoints
    location /api/ {
        limit_req zone=general_api burst=20 nodelay;
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers (eğer gerekiyorsa)
        add_header Access-Control-Allow-Origin "https://yourdomain.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;

        if ($request_method = OPTIONS) {
            return 204;
        }
    }

    # Health check (rate limiting yok)
    location /api/v1/core/health/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
    }

    # Root redirect
    location / {
        return 301 https://yourdomain.com/admin/;
    }
}
```

### 3. Konfigürasyonu Aktifleştir

```bash
# Symlink oluştur
sudo ln -s /etc/nginx/sites-available/news_backend /etc/nginx/sites-enabled/

# Default site'ı kaldır (opsiyonel)
sudo rm /etc/nginx/sites-enabled/default

# Nginx config test et
sudo nginx -t

# Nginx'i restart et
sudo systemctl restart nginx
```

---

## 🔒 SSL/HTTPS Kurulumu

### 1. Certbot Yükle

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. SSL Sertifikası Al

```bash
# Let's Encrypt sertifikası al (otomatik Nginx config)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Email gir ve terms'i kabul et
```

### 3. Auto-Renewal Test

```bash
# Renewal test et
sudo certbot renew --dry-run

# Cron job otomatik eklenir (günde 2 kez kontrol eder)
```

---

## 🔄 Systemd Servisleri

### 1. Celery Worker

```bash
sudo nano /etc/systemd/system/celery.service
```

```ini
[Unit]
Description=Celery Worker for News Backend
After=network.target redis.target

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/home/user/news_backend
Environment="PATH=/home/user/news_backend/venv/bin"

ExecStart=/home/user/news_backend/venv/bin/celery -A config worker \
    -P gevent -c 100 \
    --loglevel=info \
    --logfile=/var/log/celery/worker.log \
    --pidfile=/run/celery/worker.pid

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 2. Celery Beat

```bash
sudo nano /etc/systemd/system/celery-beat.service
```

```ini
[Unit]
Description=Celery Beat Scheduler
After=network.target redis.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/home/user/news_backend
Environment="PATH=/home/user/news_backend/venv/bin"

ExecStart=/home/user/news_backend/venv/bin/celery -A config beat \
    --loglevel=info \
    --logfile=/var/log/celery/beat.log \
    --pidfile=/run/celery/beat.pid

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 3. Dizinleri Oluştur

```bash
# Celery için
sudo mkdir -p /var/log/celery
sudo mkdir -p /run/celery
sudo chown -R www-data:www-data /var/log/celery
sudo chown -R www-data:www-data /run/celery

# Daphne için (eğer yoksa)
sudo mkdir -p /run/daphne
sudo chown -R www-data:www-data /run/daphne
```

### 4. Tüm Servisleri Başlat

```bash
# Reload systemd
sudo systemctl daemon-reload

# Servisleri başlat
sudo systemctl start daphne celery celery-beat
sudo systemctl enable daphne celery celery-beat

# Status kontrol
sudo systemctl status daphne
sudo systemctl status celery
sudo systemctl status celery-beat
```

---

## 🧪 Testing

### 1. HTTP API Test

```bash
# Health check
curl https://yourdomain.com/api/v1/core/health/

# Search test
curl "https://yourdomain.com/api/v1/core/search/?q=test"
```

### 2. WebSocket Test

**wscat yükle:**
```bash
npm install -g wscat
```

**Test et:**
```bash
# Breaking news WebSocket (auth gerektirmez)
wscat -c "wss://yourdomain.com/ws/breaking-news/"

# Notifications WebSocket (auth gerektirir)
# Önce token al
TOKEN=$(curl -X POST https://yourdomain.com/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}' | jq -r .access)

# WebSocket'e bağlan
wscat -c "wss://yourdomain.com/ws/notifications/" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Frontend JavaScript Test

```html
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Test</title>
</head>
<body>
    <h1>WebSocket Test</h1>
    <div id="messages"></div>

    <script>
        // Breaking News WebSocket
        const ws = new WebSocket('wss://yourdomain.com/ws/breaking-news/');

        ws.onopen = () => {
            console.log('Connected!');
            document.getElementById('messages').innerHTML += '<p>Connected to WebSocket</p>';
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Message:', data);
            document.getElementById('messages').innerHTML += `<p>${JSON.stringify(data)}</p>`;
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('Disconnected');
        };
    </script>
</body>
</html>
```

---

## 🐛 Troubleshooting

### Problem 1: WebSocket Connection Failed

**Hata:**
```
WebSocket connection to 'wss://yourdomain.com/ws/notifications/' failed
```

**Çözümler:**

1. **Nginx WebSocket config kontrolü:**
```bash
# /etc/nginx/sites-available/news_backend kontrol et
grep -A 10 "location /ws/" /etc/nginx/sites-available/news_backend
```

2. **Daphne çalışıyor mu:**
```bash
sudo systemctl status daphne
sudo journalctl -u daphne -n 50
```

3. **Socket dosyası var mı:**
```bash
ls -la /run/daphne/
# daphne.sock görünmeli
```

4. **Permissions kontrolü:**
```bash
sudo chown -R www-data:www-data /run/daphne
sudo chmod 755 /run/daphne
sudo systemctl restart daphne
```

### Problem 2: 502 Bad Gateway

**Çözümler:**

1. **Daphne loglarını kontrol et:**
```bash
sudo journalctl -u daphne -f
```

2. **Unix socket test et:**
```bash
# Socket'e bağlanabilir miyiz?
curl --unix-socket /run/daphne/daphne.sock http://localhost/api/v1/core/health/
```

3. **SELinux (RedHat/CentOS) ise:**
```bash
sudo setsebool -P httpd_can_network_connect 1
```

### Problem 3: Redis Connection Error

**Hata:**
```
redis.exceptions.ConnectionError: Error connecting to Redis
```

**Çözümler:**

1. **Redis çalışıyor mu:**
```bash
sudo systemctl status redis-server
redis-cli ping
```

2. **Password doğru mu:**
```bash
# Redis'e bağlan
redis-cli -a YOUR_PASSWORD
# PONG dönmeli
```

3. **Config kontrolü:**
```bash
# .env dosyasında REDIS_URL doğru mu?
grep REDIS_URL .env
```

### Problem 4: Celery Tasks Çalışmıyor

**Çözümler:**

1. **Celery worker çalışıyor mu:**
```bash
sudo systemctl status celery
sudo journalctl -u celery -f
```

2. **Redis broker bağlantısı:**
```bash
# settings.py'de CELERY_BROKER_URL doğru mu?
python manage.py shell
>>> from celery import current_app
>>> current_app.connection().ensure_connection(max_retries=3)
```

3. **Manuel task test:**
```bash
python manage.py shell
>>> from apps.analytics.tasks import record_article_view
>>> record_article_view.delay(1)
```

---

## 📝 Maintenance

### Log Rotation

```bash
sudo nano /etc/logrotate.d/news_backend
```

```conf
/var/log/celery/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload celery
    endscript
}
```

### Database Backup

```bash
# Otomatik backup script
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
pg_dump -U dbuser news_db | gzip > $BACKUP_DIR/news_db_$DATE.sql.gz

# 30 günden eski backupları sil
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### Monitoring

```bash
# Systemd service status
sudo systemctl status daphne celery celery-beat nginx redis

# Resource usage
htop
df -h
free -h

# Nginx access log
tail -f /var/log/nginx/news_backend_access.log

# Daphne log
sudo journalctl -u daphne -f

# Celery log
tail -f /var/log/celery/worker.log
```

---

## ✅ Deployment Checklist

- [ ] Redis kuruldu ve çalışıyor
- [ ] PostgreSQL kuruldu ve database oluşturuldu
- [ ] Python virtual environment oluşturuldu
- [ ] Tüm paketler yüklendi (`pip install -r requirements.txt`)
- [ ] `.env` dosyası oluşturuldu ve dolduruldu
- [ ] `python manage.py migrate` çalıştırıldı
- [ ] `python manage.py collectstatic` çalıştırıldı
- [ ] Superuser oluşturuldu
- [ ] Daphne systemd service kuruldu ve çalışıyor
- [ ] Celery worker ve beat servisleri çalışıyor
- [ ] Nginx kuruldu ve konfigüre edildi
- [ ] SSL sertifikası alındı (Let's Encrypt)
- [ ] WebSocket test edildi ve çalışıyor
- [ ] API endpoints test edildi
- [ ] Static files serve ediliyor
- [ ] Media files serve ediliyor
- [ ] Rate limiting test edildi
- [ ] Log rotation ayarlandı
- [ ] Backup script oluşturuldu

---

## 🚀 Quick Start Commands

```bash
# Tüm servisleri başlat
sudo systemctl start daphne celery celery-beat nginx redis

# Tüm servisleri durdur
sudo systemctl stop daphne celery celery-beat

# Tüm servisleri restart et
sudo systemctl restart daphne celery celery-beat nginx

# Logları takip et
sudo journalctl -u daphne -f

# Nginx reload (config değişikliği sonrası)
sudo nginx -t && sudo systemctl reload nginx
```

---

**Deployment tamamlandı!** 🎉

WebSocket desteği ile birlikte tüm backend artık production'da çalışıyor olmalı.
