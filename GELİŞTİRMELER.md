# 🚀 HABER SİTESİ BACKEND GELİŞTİRMELERİ

## 📋 İçindekiler
1. [Yeni Özellikler](#yeni-özellikler)
2. [Reklam Sistemi](#reklam-sistemi)
3. [Bookmark Sistemi](#bookmark-sistemi)
4. [Video Haber Desteği](#video-haber-desteği)
5. [SEO Geliştirmeleri](#seo-geliştirmeleri)
6. [Kurulum Adımları](#kurulum-adımları)
7. [API Endpoints](#api-endpoints)

---

## 🎯 Yeni Özellikler

### 1. 🎯 Kapsamlı Reklam Yönetim Sistemi
Profesyonel düzeyde reklam yönetimi için tam kapsamlı bir sistem eklendi.

**Özellikler:**
- ✅ Reklam Bölgeleri (Banner, Sidebar, In-Article, Floating, Pop-up, vb.)
- ✅ Reklamverenler Yönetimi
- ✅ Kampanya Yönetimi
- ✅ Çoklu Fiyatlandırma Modelleri (CPM, CPC, CPA, Sabit Ücret)
- ✅ Hedefleme (Ülke, Şehir, Cihaz, Kategori)
- ✅ Reklam Formatları (Görsel, HTML, Video, Script/AdSense, Native)
- ✅ Gerçek Zamanlı İstatistikler ve Raporlama
- ✅ Gösterim ve Tıklama Takibi
- ✅ Dönüşüm Takibi
- ✅ AdBlock Tespiti
- ✅ Ağırlıklı Reklam Rotasyonu
- ✅ Bütçe Yönetimi ve Limitleri
- ✅ A/B Testing için Öncelik Sistemi

**Dosyalar:**
- `apps/advertisements/models.py` - 9 kapsamlı model
- `apps/advertisements/views.py` - Gelişmiş API viewları
- `apps/advertisements/serializers.py` - Serializer'lar
- `apps/advertisements/admin.py` - Admin panel entegrasyonu

**API Endpoints:**
```
GET    /api/v1/advertisements/zones/              - Reklam bölgeleri listesi
POST   /api/v1/advertisements/zones/              - Yeni bölge oluştur
GET    /api/v1/advertisements/advertisers/        - Reklamverenler
POST   /api/v1/advertisements/advertisers/        - Yeni reklamveren
GET    /api/v1/advertisements/campaigns/          - Kampanyalar
POST   /api/v1/advertisements/campaigns/          - Yeni kampanya
GET    /api/v1/advertisements/campaigns/{id}/performance/ - Performans raporu
POST   /api/v1/advertisements/campaigns/{id}/pause/ - Kampanyayı duraklat
POST   /api/v1/advertisements/campaigns/{id}/resume/ - Kampanyayı devam ettir
GET    /api/v1/advertisements/ads/                - Reklamlar
POST   /api/v1/advertisements/ads/                - Yeni reklam
GET    /api/v1/advertisements/ads/get_for_zone/   - Bölge için reklam getir
POST   /api/v1/advertisements/ads/{id}/track_impression/ - Gösterim kaydet
POST   /api/v1/advertisements/ads/{id}/track_click/ - Tıklama kaydet
POST   /api/v1/advertisements/ads/track_adblock/  - AdBlock tespiti
GET    /api/v1/advertisements/statistics/dashboard/ - Genel dashboard
GET    /api/v1/advertisements/statistics/revenue_report/ - Gelir raporu
```

**Kullanım Örneği:**
```python
# Frontend'den reklam almak için
response = requests.get('/api/v1/advertisements/ads/get_for_zone/', {
    'zone_id': 1,
    'page_url': 'https://example.com/article/123'
})

# Gösterimi kaydet
requests.post(f'/api/v1/advertisements/ads/{ad_id}/track_impression/', {
    'page_url': 'https://example.com/article/123',
    'device_type': 'desktop',
    'country': 'TR',
    'city': 'Istanbul'
})

# Tıklamayı kaydet
requests.post(f'/api/v1/advertisements/ads/{ad_id}/track_click/', {
    'impression_id': impression_id,
    'page_url': 'https://example.com/article/123'
})
```

---

### 2. 🔖 Bookmark ve Okuma Listesi Sistemi
Kullanıcıların haberleri kaydetmesi, organize etmesi ve okuma geçmişini takip etmesi için kapsamlı sistem.

**Özellikler:**
- ✅ Bookmark Klasörleri (Renkli, İkonlu, Sıralanabilir)
- ✅ Kişisel Notlar ve Etiketler
- ✅ Favori İşaretleme
- ✅ Hatırlatıcılar
- ✅ Okuma Geçmişi Takibi
- ✅ Okuma Yüzdesi ve Süre Takibi
- ✅ Okuma Listeleri (Özel ve Herkese Açık)
- ✅ "Daha Sonra Oku" Özelliği

**Dosyalar:**
- `apps/bookmarks/models.py` - 5 model
- `apps/bookmarks/views.py` - API viewları
- `apps/bookmarks/serializers.py` - Serializer'lar

**API Endpoints:**
```
GET    /api/v1/bookmarks/folders/                 - Klasörler
POST   /api/v1/bookmarks/folders/                 - Yeni klasör
GET    /api/v1/bookmarks/bookmarks/               - Kaydedilen haberler
POST   /api/v1/bookmarks/bookmarks/               - Yeni bookmark
POST   /api/v1/bookmarks/bookmarks/{id}/toggle_favorite/ - Favori işaretle
POST   /api/v1/bookmarks/bookmarks/{id}/toggle_read/ - Okundu işaretle
GET    /api/v1/bookmarks/history/                 - Okuma geçmişi
POST   /api/v1/bookmarks/history/                 - Okuma kaydı ekle
GET    /api/v1/bookmarks/lists/                   - Okuma listeleri
POST   /api/v1/bookmarks/lists/                   - Yeni liste
POST   /api/v1/bookmarks/lists/{id}/add_article/  - Listeye makale ekle
POST   /api/v1/bookmarks/lists/{id}/remove_article/ - Listeden makale çıkar
```

**Kullanım Örneği:**
```python
# Haber kaydet
response = requests.post('/api/v1/bookmarks/bookmarks/', {
    'article': 123,
    'folder': 1,
    'note': 'Önemli haber, tekrar oku',
    'tags': 'teknoloji, önemli'
})

# Okuma geçmişi kaydet
requests.post('/api/v1/bookmarks/history/', {
    'article': 123,
    'read_percentage': 75,
    'time_spent': 180,  # saniye
    'scroll_depth': 1200,  # px
    'device_type': 'mobile'
})
```

---

### 3. 📹 Video Haber Desteği
Haberlere video içerik ekleme desteği.

**Article Modelinde Yeni Alanlar:**
```python
has_video = models.BooleanField(default=False)
video_url = models.URLField(blank=True)  # YouTube, Vimeo, vb.
video_file = models.FileField(upload_to='videos/')  # Direkt yükleme
video_thumbnail = models.ImageField(upload_to='video_thumbnails/')
video_duration = models.PositiveIntegerField(default=0)  # saniye
video_embed_code = models.TextField(blank=True)  # Özel embed
```

**Desteklenen Platformlar:**
- YouTube
- Vimeo  
- Dailymotion
- Direkt video dosyası

**Yardımcı Fonksiyonlar:**
```python
# utils/helpers.py içinde
extract_video_id(url, platform='youtube')  # Video ID çıkar
generate_video_embed(url, width=640, height=360)  # Embed kodu oluştur
```

---

### 4. 📊 SEO Geliştirmeleri
Arama motoru optimizasyonu için kapsamlı araçlar.

**Özellikler:**
- ✅ XML Sitemap (Dinamik)
- ✅ RSS/Atom Feed
- ✅ robots.txt
- ✅ ads.txt
- ✅ Kategori bazlı RSS
- ✅ Son dakika RSS

**Dosyalar:**
- `apps/seo/sitemaps.py` - Dinamik sitemap'ler
- `apps/seo/feeds.py` - RSS/Atom feed'ler
- `apps/seo/views.py` - robots.txt, ads.txt

**Sitemap URLs:**
```
/sitemap.xml                    - Ana sitemap
/sitemap-articles.xml          - Haberler sitemap
/sitemap-categories.xml        - Kategoriler sitemap
/sitemap-tags.xml              - Etiketler sitemap
/sitemap-static.xml            - Statik sayfalar sitemap
```

**RSS/Atom URLs:**
```
/rss/                          - Ana RSS feed (son 20 haber)
/atom/                         - Atom feed
/rss/category/{slug}/          - Kategori RSS
/rss/breaking/                 - Son dakika RSS
```

---

### 5. 🛠️ Yardımcı Fonksiyonlar
`utils/helpers.py` dosyasında eksiksiz fonksiyon kütüphanesi eklendi.

**Fonksiyonlar:**
- `generate_unique_slug()` - Benzersiz slug oluştur
- `calculate_read_time()` - Okuma süresi hesapla
- `clean_html()` - HTML temizle ve güvenli hale getir
- `truncate_words()` - Metni kısalt
- `extract_video_id()` - Video ID çıkar
- `generate_video_embed()` - Embed kod oluştur
- `format_number()` - Sayı formatla (1K, 1M)
- `get_client_ip()` - Client IP al
- `parse_user_agent()` - User agent parse et

---

## 🔧 Kurulum Adımları

### 1. Yeni Bağımlılıklar
Yeni özellikler için eklenen bağımlılıklar zaten `requirements.txt` içinde mevcut:
- `beautifulsoup4` - HTML parsing
- `bleach` - HTML temizleme
- `user-agents` - User agent parsing

### 2. Database Migration
```bash
# Yeni modeller için migration oluştur
python manage.py makemigrations advertisements
python manage.py makemigrations bookmarks
python manage.py makemigrations articles  # Video alanları için

# Migration'ları çalıştır
python manage.py migrate
```

### 3. Static Files
```bash
python manage.py collectstatic --noinput
```

### 4. Superuser Oluştur (Eğer yoksa)
```bash
python manage.py createsuperuser
```

### 5. Test Et
```bash
# Sunucuyu başlat
python manage.py runserver

# API dokümantasyonunu ziyaret et
http://localhost:8000/api/docs/
```

---

## 📝 Güncellenen Dosyalar

### Değiştirilen Dosyalar:
1. `config/settings.py` - Yeni app'ler eklendi
2. `config/urls.py` - Yeni endpoint'ler eklendi
3. `apps/articles/models.py` - Video alanları eklendi

### Yeni Dosyalar:
```
apps/
├── advertisements/          # YENİ: Reklam sistemi
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── admin.py
│   ├── urls.py
│   └── apps.py
│
├── bookmarks/              # YENİ: Bookmark sistemi
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── admin.py
│   ├── urls.py
│   └── apps.py
│
└── seo/                    # YENİ: SEO araçları
    ├── sitemaps.py
    ├── feeds.py
    └── views.py

utils/                      # YENİ: Yardımcı fonksiyonlar
├── __init__.py
├── helpers.py
└── exception_handler.py
```

---

## 🎨 Admin Panel Geliştirmeleri

Tüm yeni modeller admin panel'e eksiksiz entegre edildi:

### Reklam Yönetimi
- Reklam Bölgeleri
- Reklamverenler (İstatistiklerle)
- Kampanyalar (CTR, dönüşüm oranlarıyla)
- Reklamlar (Önizleme ile)
- Gösterim/Tıklama/Dönüşüm Kayıtları
- AdBlock Tespitleri

### Bookmark Yönetimi
- Bookmark Klasörleri
- Bookmarklar
- Okuma Geçmişi
- Okuma Listeleri

Her model için:
- ✅ Filtreleme
- ✅ Arama
- ✅ Sıralama
- ✅ Toplu işlemler
- ✅ İlişkili veri gösterimi

---

## 🚦 Performans İyileştirmeleri

1. **Cache Kullanımı:**
   - Reklam sorguları 5 dakika cache'lenir
   - Sitemap'ler otomatik cache'lenir

2. **Database İndeksleri:**
   - Tüm yeni modellere uygun indeksler eklendi
   - Sık sorgulanan alanlar için kompozit indeksler

3. **Query Optimizasyonu:**
   - `select_related()` ve `prefetch_related()` kullanımı
   - N+1 problem'lerini engelleyen yapı

---

## 📱 Frontend Entegrasyon Önerileri

### Reklam Gösterimi
```javascript
// React örneği
const AdZone = ({ zoneId }) => {
  const [ad, setAd] = useState(null);
  
  useEffect(() => {
    // Reklamı al
    fetch(`/api/v1/advertisements/ads/get_for_zone/?zone_id=${zoneId}`)
      .then(res => res.json())
      .then(data => {
        setAd(data);
        // Gösterimi kaydet
        trackImpression(data.id);
      });
  }, [zoneId]);
  
  const trackImpression = (adId) => {
    fetch(`/api/v1/advertisements/ads/${adId}/track_impression/`, {
      method: 'POST',
      body: JSON.stringify({
        page_url: window.location.href,
        device_type: 'desktop',
        // ... diğer bilgiler
      })
    });
  };
  
  const handleClick = () => {
    // Tıklamayı kaydet
    fetch(`/api/v1/advertisements/ads/${ad.id}/track_click/`, {
      method: 'POST',
      body: JSON.stringify({
        page_url: window.location.href
      })
    }).then(() => {
      window.open(ad.target_url, ad.open_in_new_tab ? '_blank' : '_self');
    });
  };
  
  if (!ad) return null;
  
  return (
    <div className="ad-zone" onClick={handleClick}>
      {ad.ad_type === 'image' && <img src={ad.image} alt={ad.name} />}
      {ad.ad_type === 'html' && <div dangerouslySetInnerHTML={{__html: ad.html_content}} />}
      {/* ... diğer ad tipleri */}
    </div>
  );
};
```

### Bookmark İşlemleri
```javascript
const BookmarkButton = ({ articleId }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const toggleBookmark = async () => {
    if (isBookmarked) {
      await fetch(`/api/v1/bookmarks/bookmarks/${bookmarkId}/`, {
        method: 'DELETE'
      });
    } else {
      await fetch('/api/v1/bookmarks/bookmarks/', {
        method: 'POST',
        body: JSON.stringify({ article: articleId })
      });
    }
    setIsBookmarked(!isBookmarked);
  };
  
  return (
    <button onClick={toggleBookmark}>
      {isBookmarked ? 'Kaydedildi' : 'Kaydet'}
    </button>
  );
};
```

---

## 🔒 Güvenlik Notları

1. **Reklam Sistemi:**
   - Script kodları admin kullanıcılar tarafından eklenebilir
   - HTML içerik `bleach` ile temizlenir
   - Rate limiting ile spam koruması

2. **Bookmark Sistemi:**
   - Kullanıcılar sadece kendi bookmark'larını görebilir
   - Permission kontrolü her endpoint'te mevcut

3. **Video İçerik:**
   - Video URL'leri whitelist kontrolünden geçer
   - Embed kodları sanitize edilir

---

## 📈 İzleme ve Analitik

Reklam sistemi ayrıntılı analitik sağlar:

```python
# Dashboard endpoint'inden örnek response
{
  "period": "daily",
  "total_campaigns": 15,
  "active_campaigns": 8,
  "total_impressions": 125000,
  "total_clicks": 2500,
  "total_conversions": 125,
  "total_revenue": 15000.00,
  "average_ctr": 2.0,
  "average_conversion_rate": 5.0,
  "top_performing_ads": [...],
  "adblock_detections": 1500
}
```

---

## 🎯 Gelecek Geliştirme Önerileri

Backend hazır, aşağıdakiler için frontend geliştirme yapılabilir:

1. **Push Notification Sistemi:**
   - Firebase/OneSignal entegrasyonu
   - Model ve API hazır değil (gerekirse ekleyebilirim)

2. **Sosyal Medya Paylaşım:**
   - Mevcut analytics'te takip var
   - Frontend paylaşım butonları eklenebilir

3. **Gelişmiş Arama:**
   - Elasticsearch entegrasyonu düşünülebilir
   - Şu an Django filter yeterli

4. **Real-time Bildirimler:**
   - WebSocket/Django Channels
   - Breaking news bildirimleri için

5. **A/B Testing:**
   - Reklam sistemi öncelik desteği var
   - Ayrı A/B testing framework'ü eklenebilir

---

## 💡 İpuçları

1. **Cache Ayarları:**
   - Production'da Redis kullanın
   - Cache süreleri ihtiyaca göre ayarlayın

2. **Reklam Performansı:**
   - Düşük CTR'li reklamları duraklatın
   - Ağırlık değerlerini optimize edin

3. **Database Optimizasyonu:**
   - Düzenli olarak `python manage.py clearsessions` çalıştırın
   - Eski analitik verilerini arşivleyin

4. **Monitoring:**
   - Django Silk ile API performansını izleyin
   - Celery task'larını flower ile monitör edin

---

## 🤝 Destek

Herhangi bir sorunuz veya ek geliştirme ihtiyacınız olursa:
- Admin panel üzerinden test edin
- API dokümantasyonunu inceleyin: `/api/docs/`
- Log dosyalarını kontrol edin

---

**Tüm Özellikler Production-Ready! 🚀**

Eksik bir şey varsa veya özel bir geliştirme istiyorsanız lütfen belirtin!
