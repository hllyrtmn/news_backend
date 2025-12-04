#!/bin/bash

echo "🚀 Haber Sitesi Backend Kurulumu Başlıyor..."

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python versiyonu: $python_version"

# Create virtual environment
echo "📦 Virtual environment oluşturuluyor..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "📥 Bağımlılıklar yükleniyor..."
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    echo "⚙️  .env dosyası oluşturuluyor..."
    cp .env.example .env
    echo "⚠️  UYARI: .env dosyasını düzenlemeyi unutmayın!"
fi

# Create necessary directories
echo "📁 Klasörler oluşturuluyor..."
mkdir -p logs media staticfiles

# Database migrations
echo "🗄️  Veritabanı migrations oluşturuluyor..."
python manage.py makemigrations

echo "✅ Kurulum tamamlandı!"
echo ""
echo "Sonraki adımlar:"
echo "1. .env dosyasını düzenleyin"
echo "2. PostgreSQL veritabanı oluşturun: createdb news_db"
echo "3. Redis'i başlatın: redis-server"
echo "4. Migrations'ları çalıştırın: python manage.py migrate"
echo "5. Superuser oluşturun: python manage.py createsuperuser"
echo "6. Server'ı başlatın: python manage.py runserver"
echo ""
echo "Celery için:"
echo "- Worker: celery -A config worker -l info"
echo "- Beat: celery -A config beat -l info"
