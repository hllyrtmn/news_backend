# ⚡ Hızlı Başlangıç Kılavuzu

## 1️⃣ Projeyi Açın

```bash
tar -xzf news_backend.tar.gz
cd news_backend
```

## 2️⃣ Otomatik Kurulum

```bash
chmod +x setup.sh
./setup.sh
```

## 3️⃣ .env Dosyasını Düzenleyin

```bash
nano .env  # veya favori editörünüz
```

Minimum gerekli ayarlar:
```
SECRET_KEY=your-secret-key-change-this
DEBUG=True
DATABASE_URL=postgresql://postgres:password@localhost:5432/news_db
REDIS_URL=redis://localhost:6379/0
```

## 4️⃣ Veritabanını Oluşturun

```bash
# PostgreSQL'de
createdb news_db

# Migrations
python manage.py migrate
```

## 5️⃣ Superuser Oluşturun

```bash
python manage.py createsuperuser
```

## 6️⃣ Server'ı Başlatın

```bash
python manage.py runserver
```

API: http://localhost:8000/api/v1/
Admin: http://localhost:8000/admin/
Docs: http://localhost:8000/api/docs/

## 📦 Docker ile Çalıştırma (Opsiyonel)

```bash
docker-compose up -d
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py createsuperuser
```

## 🎯 İlk Test

### 1. Kullanıcı Kaydı
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "password2": "testpass123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

### 3. Haberleri Listele
```bash
curl http://localhost:8000/api/v1/articles/
```

## 🔥 Celery Başlatma

Ayrı terminal'lerde:

```bash
# Worker
celery -A config worker -l info

# Beat (scheduled tasks)
celery -A config beat -l info

# Flower (monitoring)
celery -A config flower
# http://localhost:5555/
```

## 📊 Admin Panel İlk Ayarlar

1. http://localhost:8000/admin/ adresine gidin
2. Superuser ile giriş yapın
3. Şunları oluşturun:
   - Kategoriler (Politika, Ekonomi, Spor, vb.)
   - Etiketler
   - Site Ayarları
   - Author Profile (kendi kullanıcınız için)

## 🎨 Örnek Veri Oluşturma

Admin panelden manuel olarak veya Django shell ile:

```bash
python manage.py shell
```

```python
from apps.categories.models import Category
from apps.tags.models import Tag

# Kategoriler
Category.objects.create(name="Politika", slug="politika")
Category.objects.create(name="Ekonomi", slug="ekonomi")
Category.objects.create(name="Spor", slug="spor")
Category.objects.create(name="Teknoloji", slug="teknoloji")

# Etiketler
Tag.objects.create(name="gündem", slug="gundem")
Tag.objects.create(name="son-dakika", slug="son-dakika")
```

## ⚠️ Sık Karşılaşılan Sorunlar

### Redis bağlantı hatası
```bash
# Redis'in çalıştığından emin olun
redis-cli ping
# Yanıt: PONG
```

### PostgreSQL bağlantı hatası
```bash
# PostgreSQL'in çalıştığından emin olun
psql -U postgres -c "SELECT version();"
```

### Migration hataları
```bash
python manage.py makemigrations
python manage.py migrate --run-syncdb
```

## 📚 Daha Fazla Bilgi

- Tam dokümantasyon: README.md
- API dokümantasyonu: http://localhost:8000/api/docs/
- Admin panel: http://localhost:8000/admin/

## 🎉 Başarılı!

Artık Django REST Framework haber backend'iniz çalışıyor!

Frontend için bu API'leri kullanabilirsiniz:
- React
- Vue.js
- Angular
- Next.js
- Flutter (mobil)
- React Native (mobil)

Her türlü frontend framework ile uyumludur! 🚀
