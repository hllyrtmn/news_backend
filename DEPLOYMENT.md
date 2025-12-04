# Deployment Guide - News Backend API

Bu dokümanda, News Backend API'sinin production ortamına deployment'ı adım adım anlatılmıştır.

## 📋 Ön Gereksinimler

- Python 3.10+
- PostgreSQL 13+ (MySQL yerine PostgreSQL önerilir)
- Redis 6+
- Nginx (reverse proxy)
- Supervisor (process management)
- SSL sertifikası (Let's Encrypt)

## 🔧 Adım 1: Sunucu Hazırlığı

### 1.1 Sistem Güncellemeleri

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv postgresql postgresql-contrib redis-server nginx supervisor
```

### 1.2 Kullanıcı Oluşturma

```bash
sudo useradd -m -s /bin/bash newsapp
sudo su - newsapp
```

## 📦 Adım 2: Proje Kurulumu

### 2.1 Proje Dosyalarını Klonlama

```bash
cd /home/newsapp
git clone <repository-url> news_backend
cd news_backend
```

### 2.2 Virtual Environment Oluşturma

```bash
python3 -m venv venv
source venv/bin/activate
```

### 2.3 Bağımlılıkları Yükleme

```bash
pip install -r requirements.txt
pip install gunicorn psycopg2-binary
```

## 🗄️ Adım 3: Veritabanı Kurulumu

### 3.1 PostgreSQL Veritabanı Oluşturma

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE news_db;
CREATE USER newsuser WITH PASSWORD 'strong_password_here';
ALTER ROLE newsuser SET client_encoding TO 'utf8';
ALTER ROLE newsuser SET default_transaction_isolation TO 'read committed';
ALTER ROLE newsuser SET default_transaction_deferrable TO on;
ALTER ROLE newsuser SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE news_db TO newsuser;
\q
```

### 3.2 Environment Variables Ayarlama

```bash
cp .env.example .env
nano .env
```

**.env dosyasında şunları güncelleyin:**

```
DEBUG=False
SECRET_KEY=your-very-secure-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://newsuser:strong_password_here@localhost:5432/news_db
REDIS_URL=redis://127.0.0.1:6379/0
CELERY_BROKER_URL=redis://127.0.0.1:6379/1
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### 3.3 Migrations Çalıştırma

```bash
python manage.py migrate
python manage.py collectstatic --no-input
python manage.py createsuperuser
```

## 🚀 Adım 4: Gunicorn Yapılandırması

### 4.1 Gunicorn Socket Dosyası

```bash
sudo nano /etc/systemd/system/gunicorn_newsapp.socket
```

```ini
[Unit]
Description=gunicorn socket for news app
Before=gunicorn_newsapp.service

[Socket]
ListenStream=/run/gunicorn_newsapp.sock
SocketUser=www-data

[Install]
WantedBy=sockets.target
```

### 4.2 Gunicorn Service Dosyası

```bash
sudo nano /etc/systemd/system/gunicorn_newsapp.service
```

```ini
[Unit]
Description=gunicorn daemon for news app
Requires=gunicorn_newsapp.socket
After=network.target

[Service]
Type=notify
User=newsapp
Group=www-data
WorkingDirectory=/home/newsapp/news_backend
Environment="PATH=/home/newsapp/news_backend/venv/bin"
ExecStart=/home/newsapp/news_backend/venv/bin/gunicorn \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind unix:/run/gunicorn_newsapp.sock \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
```

### 4.3 Gunicorn Başlatma

```bash
sudo systemctl daemon-reload
sudo systemctl start gunicorn_newsapp.socket
sudo systemctl enable gunicorn_newsapp.socket
sudo systemctl start gunicorn_newsapp.service
sudo systemctl enable gunicorn_newsapp.service
```

## 🔄 Adım 5: Celery Yapılandırması

### 5.1 Celery Worker Service

```bash
sudo nano /etc/systemd/system/celery_newsapp.service
```

```ini
[Unit]
Description=Celery Service for News App
After=network.target

[Service]
Type=forking
User=newsapp
Group=newsapp
WorkingDirectory=/home/newsapp/news_backend
Environment="PATH=/home/newsapp/news_backend/venv/bin"
ExecStart=/home/newsapp/news_backend/venv/bin/celery -A config worker -l info --logfile=/var/log/celery_newsapp.log

[Install]
WantedBy=multi-user.target
```

### 5.2 Celery Beat Service

```bash
sudo nano /etc/systemd/system/celery_beat_newsapp.service
```

```ini
[Unit]
Description=Celery Beat Service for News App
After=network.target

[Service]
Type=simple
User=newsapp
Group=newsapp
WorkingDirectory=/home/newsapp/news_backend
Environment="PATH=/home/newsapp/news_backend/venv/bin"
ExecStart=/home/newsapp/news_backend/venv/bin/celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler

[Install]
WantedBy=multi-user.target
```

### 5.3 Celery Başlatma

```bash
sudo systemctl start celery_newsapp.service
sudo systemctl enable celery_newsapp.service
sudo systemctl start celery_beat_newsapp.service
sudo systemctl enable celery_beat_newsapp.service
```

## 🌐 Adım 6: Nginx Yapılandırması

### 6.1 Nginx Config Dosyası

```bash
sudo nano /etc/nginx/sites-available/news_backend
```

```nginx
upstream gunicorn_newsapp {
    server unix:/run/gunicorn_newsapp.sock fail_timeout=0;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    client_max_body_size 10M;
    
    location /static/ {
        alias /home/newsapp/news_backend/staticfiles/;
        expires 30d;
    }
    
    location /media/ {
        alias /home/newsapp/news_backend/media/;
        expires 7d;
    }
    
    location / {
        proxy_pass http://gunicorn_newsapp;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
}
```

### 6.2 Nginx Etkinleştirme

```bash
sudo ln -s /etc/nginx/sites-available/news_backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Adım 7: SSL Sertifikası (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

## 📊 Adım 8: Monitoring ve Logging

### 8.1 Log Dosyaları

```bash
sudo mkdir -p /var/log/newsapp
sudo chown newsapp:newsapp /var/log/newsapp
```

### 8.2 Logrotate Yapılandırması

```bash
sudo nano /etc/logrotate.d/newsapp
```

```
/var/log/newsapp/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 newsapp newsapp
    sharedscripts
}
```

## 🔍 Adım 9: Health Check ve Monitoring

### 9.1 Health Check Endpoint

```bash
curl https://yourdomain.com/api/v1/core/health/
```

### 9.2 Sentry Entegrasyonu (Opsiyonel)

`.env` dosyasına ekleyin:
```
SENTRY_DSN=your-sentry-dsn-here
```

## ✅ Production Checklist

- [ ] DEBUG=False
- [ ] SECRET_KEY güvenli ve unique
- [ ] ALLOWED_HOSTS ayarlandı
- [ ] HTTPS/SSL aktif
- [ ] PostgreSQL production ayarları
- [ ] Redis production ayarları
- [ ] Static/Media files doğru konumda
- [ ] Celery worker çalışıyor
- [ ] Celery beat çalışıyor
- [ ] Gunicorn/uWSGI ile serve
- [ ] Nginx reverse proxy
- [ ] SSL sertifikası
- [ ] Backup stratejisi
- [ ] Monitoring (Sentry)
- [ ] Log rotation
- [ ] Database backups scheduled
- [ ] Rate limiting aktif
- [ ] CORS properly configured
- [ ] Email notifications test edildi
- [ ] Health check endpoint test edildi

## 🔄 Güncellemeler ve Maintenance

### Kod Güncellemesi

```bash
cd /home/newsapp/news_backend
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --no-input
sudo systemctl restart gunicorn_newsapp.service
```

### Database Backup

```bash
sudo -u postgres pg_dump news_db > /home/newsapp/backups/news_db_$(date +%Y%m%d_%H%M%S).sql
```

### Backup Automation

```bash
# Crontab'a ekleyin
0 2 * * * sudo -u postgres pg_dump news_db > /home/newsapp/backups/news_db_$(date +\%Y\%m\%d_\%H\%M\%S).sql
```

## 🆘 Troubleshooting

### Gunicorn Hataları

```bash
sudo journalctl -u gunicorn_newsapp.service -n 50
```

### Celery Hataları

```bash
sudo journalctl -u celery_newsapp.service -n 50
```

### Nginx Hataları

```bash
sudo tail -f /var/log/nginx/error.log
```

### Database Bağlantı Sorunu

```bash
python manage.py dbshell
```

## 📞 İletişim ve Destek

Deployment ile ilgili sorunlar için: [support@example.com]

---

**Son Güncelleme**: 04 Aralık 2025
