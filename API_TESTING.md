# API Testing Guide

Bu dokümanda, News Backend API'sinin test edilmesi için örnekler ve best practices verilmiştir.

## 🧪 Unit Tests

### Test Dosyası Yapısı

```
apps/
├── articles/
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_models.py
│   │   ├── test_views.py
│   │   ├── test_serializers.py
│   │   └── test_filters.py
```

### Test Çalıştırma

```bash
# Tüm testleri çalıştır
pytest

# Spesifik app'in testlerini çalıştır
pytest apps/articles/tests/

# Coverage raporu oluştur
pytest --cov=apps --cov-report=html

# Verbose mode
pytest -v

# Spesifik test fonksiyonu
pytest apps/articles/tests/test_views.py::ArticleViewSetTestCase::test_list_articles
```

## 📝 Örnek Test Dosyası

### articles/tests/test_views.py

```python
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.articles.models import Article
from apps.categories.models import Category
from apps.accounts.models import AuthorProfile

User = get_user_model()


@pytest.mark.django_db
class ArticleViewSetTestCase(TestCase):
    """Test cases for Article ViewSet"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create author profile
        self.author = AuthorProfile.objects.create(
            user=self.user,
            display_name='Test Author'
        )
        
        # Create category
        self.category = Category.objects.create(
            name='Test Category',
            slug='test-category'
        )
        
        # Create test article
        self.article = Article.objects.create(
            title='Test Article',
            slug='test-article',
            summary='Test Summary',
            content='<p>Test Content</p>',
            author=self.author,
            category=self.category,
            status='published'
        )
    
    def test_list_articles(self):
        """Test listing articles"""
        response = self.client.get('/api/v1/articles/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) > 0
    
    def test_retrieve_article(self):
        """Test retrieving single article"""
        response = self.client.get(f'/api/v1/articles/{self.article.slug}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Test Article'
    
    def test_create_article_authenticated(self):
        """Test creating article as authenticated user"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'title': 'New Article',
            'summary': 'New Summary',
            'content': '<p>New Content</p>',
            'author': self.author.id,
            'category': self.category.id,
            'status': 'draft'
        }
        
        response = self.client.post('/api/v1/articles/', data)
        assert response.status_code == status.HTTP_201_CREATED
    
    def test_create_article_unauthenticated(self):
        """Test creating article without authentication"""
        data = {
            'title': 'New Article',
            'summary': 'New Summary',
            'content': '<p>New Content</p>',
            'author': self.author.id,
            'category': self.category.id,
            'status': 'draft'
        }
        
        response = self.client.post('/api/v1/articles/', data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
```

## 🔗 API Endpoint Testing

### Postman Collection

1. **Authentication**
   - POST `/api/v1/auth/register/` - Kayıt ol
   - POST `/api/v1/auth/login/` - Giriş yap
   - POST `/api/v1/auth/token/refresh/` - Token yenile

2. **Articles**
   - GET `/api/v1/articles/` - Haber listesi
   - GET `/api/v1/articles/{slug}/` - Haber detayı
   - POST `/api/v1/articles/` - Haber oluştur
   - PATCH `/api/v1/articles/{slug}/` - Haber güncelle
   - DELETE `/api/v1/articles/{slug}/` - Haber sil

3. **Categories**
   - GET `/api/v1/categories/` - Kategori listesi
   - GET `/api/v1/categories/{slug}/` - Kategori detayı

4. **Comments**
   - GET `/api/v1/comments/` - Yorum listesi
   - POST `/api/v1/comments/` - Yorum yap
   - PATCH `/api/v1/comments/{id}/` - Yorum güncelle

## 🐚 cURL Örnekleri

### Kayıt Ol

```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

### Giriş Yap

```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

### Haber Listesi

```bash
curl -X GET http://localhost:8000/api/v1/articles/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Haber Oluştur

```bash
curl -X POST http://localhost:8000/api/v1/articles/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Yeni Haber",
    "summary": "Özet",
    "content": "<p>İçerik</p>",
    "author": 1,
    "category": 1,
    "status": "draft"
  }'
```

## 📊 Performance Testing

### Apache Bench

```bash
# 100 request, 10 concurrent
ab -n 100 -c 10 http://localhost:8000/api/v1/articles/

# Detailed report
ab -n 100 -c 10 -g report.tsv http://localhost:8000/api/v1/articles/
```

### Locust

```python
# locustfile.py
from locust import HttpUser, task, between

class NewsAPIUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def list_articles(self):
        self.client.get("/api/v1/articles/")
    
    @task
    def get_article(self):
        self.client.get("/api/v1/articles/test-article/")
```

Çalıştırma:
```bash
locust -f locustfile.py --host=http://localhost:8000
```

## 🔐 Security Testing

### SQL Injection Test

```bash
curl "http://localhost:8000/api/v1/articles/?search='; DROP TABLE articles; --"
```

### XSS Test

```bash
curl -X POST http://localhost:8000/api/v1/comments/ \
  -H "Content-Type: application/json" \
  -d '{
    "content": "<script>alert(\"XSS\")</script>"
  }'
```

### CSRF Test

```bash
# CSRF token olmadan POST request
curl -X POST http://localhost:8000/api/v1/articles/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}'
```

## 📈 Load Testing

### Vegeta

```bash
# 100 requests/sec for 30 seconds
echo "GET http://localhost:8000/api/v1/articles/" | \
  vegeta attack -duration=30s -rate=100 | \
  vegeta report
```

## ✅ Test Checklist

- [ ] Unit tests yazıldı
- [ ] Integration tests yazıldı
- [ ] API endpoints test edildi
- [ ] Authentication test edildi
- [ ] Permissions test edildi
- [ ] Pagination test edildi
- [ ] Filtering test edildi
- [ ] Searching test edildi
- [ ] Ordering test edildi
- [ ] Error handling test edildi
- [ ] Rate limiting test edildi
- [ ] Cache test edildi
- [ ] Performance test edildi
- [ ] Security test edildi
- [ ] Load test edildi

## 📚 Kaynaklar

- [Django Testing Documentation](https://docs.djangoproject.com/en/stable/topics/testing/)
- [Django REST Framework Testing](https://www.django-rest-framework.org/api-guide/testing/)
- [Pytest Documentation](https://docs.pytest.org/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

---

**Son Güncelleme**: 04 Aralık 2025
