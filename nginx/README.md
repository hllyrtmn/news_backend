# Nginx Reverse Proxy Setup

Bu dizin, News Backend projesi için Nginx reverse proxy yapılandırmasını içerir.

## 📋 İçerik

- `nginx.conf` - Nginx yapılandırma dosyası (production-ready)
- `ssl-setup.sh` - SSL/HTTPS otomatik kurulum scripti

## 🚀 Kullanım

### Development (HTTP)

```bash
# Servisleri başlat
docker-compose up -d

# Site erişimi
http://localhost
```

### Production (HTTPS)

```bash
# 1. SSL sertifikası al
sudo ./nginx/ssl-setup.sh

# 2. Nginx yapılandırmasında domain'i güncelle
# nginx/nginx.conf dosyasında "server_name" satırını düzenle

# 3. Servisleri yeniden başlat
docker-compose restart nginx
```

## 🔧 Özellikler

### Performans
- ✅ Static file serving (CSS, JS, images)
- ✅ Gzip compression
- ✅ HTTP/2 support
- ✅ Keep-alive connections
- ✅ Proxy caching (2 dakika)
- ✅ Connection pooling

### Güvenlik
- ✅ Rate limiting (endpoint bazlı)
- ✅ Connection limiting
- ✅ Security headers
- ✅ SSL/TLS (Let's Encrypt)

### Rate Limiting

| Endpoint | Limit | Burst |
|----------|-------|-------|
| /api/v1/comments/ | 10/min | 5 |
| /api/v1/auth/ | 30/min | 10 |
| /api/v1/articles/featured/ | 30/min | 20 |
| /api/ (genel) | 100/min | 50 |

## 📊 Monitoring

Nginx logları:

```bash
# Access log
docker-compose logs nginx | grep "GET\|POST"

# Error log
docker-compose logs nginx | grep "error"

# Rate limit aşımları
docker-compose logs nginx | grep "429"
```

## 🔒 SSL/HTTPS Kurulumu

### Otomatik Kurulum (Önerilen)

```bash
sudo ./nginx/ssl-setup.sh
```

Script şunları yapar:
1. Certbot yükler
2. Let's Encrypt sertifikası alır
3. Nginx yapılandırmasını günceller
4. Auto-renewal ayarlar

### Manuel Kurulum

```bash
# 1. Certbot yükle
sudo apt-get install certbot

# 2. Sertifika al
sudo certbot certonly --standalone \
    -d example.com \
    -d www.example.com \
    --email your@email.com \
    --agree-tos

# 3. nginx.conf dosyasında HTTPS bölümünü aktif et
# (# işaretlerini kaldır)

# 4. Nginx'i yeniden başlat
docker-compose restart nginx
```

### Sertifika Yenileme

Otomatik yenileme (cron):
```bash
# Günde 2 kez kontrol eder
0 0,12 * * * certbot renew --quiet --post-hook 'docker-compose restart nginx'
```

Manuel yenileme:
```bash
sudo certbot renew
docker-compose restart nginx
```

## ⚙️ Yapılandırma

### Static Files

```nginx
location /static/ {
    alias /app/staticfiles/;
    expires 30d;  # 30 gün cache
}
```

### Media Files

```nginx
location /media/ {
    alias /app/media/;
    expires 7d;  # 7 gün cache
}
```

### API Cache

Öne çıkan, popüler, son dakika haberleri 2 dakika cache'lenir:

```nginx
location ~ ^/api/v1/articles/(featured|popular|breaking)/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 2m;
}
```

## 🔥 Production Checklist

- [ ] Domain DNS ayarlarını yap (A record)
- [ ] SSL sertifikası al (`./nginx/ssl-setup.sh`)
- [ ] `nginx.conf` dosyasında `server_name` güncelle
- [ ] Rate limiting ayarlarını test et
- [ ] SSL otomatik yenileme çalışıyor mu kontrol et
- [ ] Security headers kontrol et
- [ ] Gzip compression çalışıyor mu test et
- [ ] Cache çalışıyor mu kontrol et (`X-Cache-Status` header)

## 🐛 Sorun Giderme

### 502 Bad Gateway

```bash
# Django container çalışıyor mu?
docker-compose ps web

# Django loglarını kontrol et
docker-compose logs web
```

### 429 Too Many Requests

Rate limit aşımı. `nginx.conf` dosyasında limit artırılabilir:

```nginx
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=200r/m;  # 100'den 200'e
```

### SSL Sertifika Hataları

```bash
# Sertifikaları kontrol et
sudo certbot certificates

# Yeniden dene
sudo certbot renew --force-renewal
```

## 📈 Performans İpuçları

1. **Static files**: CDN kullan (CloudFlare, AWS CloudFront)
2. **Cache süresi**: Trafik desenine göre ayarla
3. **Worker processes**: CPU sayısına eşitle
4. **Connection limit**: Sunucu kapasitesine göre ayarla

## 🤝 Destek

Sorun yaşarsanız:
1. Nginx loglarını kontrol et: `docker-compose logs nginx`
2. Django loglarını kontrol et: `docker-compose logs web`
3. Health check: `curl http://localhost/api/v1/core/health/`
