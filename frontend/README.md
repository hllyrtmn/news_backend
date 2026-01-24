# Haber Sitesi - Angular Frontend

Angular 17 ile geliştirilmiş modern haber sitesi frontend uygulaması.

## 🚀 Özellikler

### ✅ Tam Uygulanmış Özellikler

- **Kimlik Doğrulama**
  - Kullanıcı adı/şifre ile giriş
  - Email/şifre ile kayıt
  - İki Faktörlü Kimlik Doğrulama (2FA) - QR kod ile
  - Sosyal Medya Girişi (Google, Facebook, Twitter)
  - JWT token yönetimi (otomatik yenileme)

- **WebSocket Entegrasyonu**
  - Gerçek zamanlı bildirimler
  - Breaking news (son dakika haberleri)
  - Otomatik yeniden bağlanma

- **Servisler**
  - Article Service (makale işlemleri)
  - Auth Service (kimlik doğrulama)
  - WebSocket Service (gerçek zamanlı iletişim)
  - Analytics Service (istatistikler)
  - Search Service (arama)
  - Comment Service (yorumlar)
  - Notification Service (bildirimler)

### 📋 İskelet Componentler (İçerik Eklenmesi Gerekiyor)

- Ana Sayfa
- Haber Listesi
- Haber Detay
- Kategori Sayfası
- Arama Sayfası
- Profil Sayfası
- Bildirimler
- Kaydedilenler
- Admin Paneli

## 📦 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn

### Adımlar

```bash
# Bağımlılıkları yükle
npm install

# Development sunucusunu başlat
npm start

# Build (production)
npm run build
```

## 🛠️ Teknolojiler

- **Angular 17** - Standalone Components
- **TailwindCSS** - Styling
- **RxJS** - Reactive programming
- **jwt-decode** - JWT token çözümleme
- **qrcode** - QR kod üretimi (2FA için)

## 📁 Proje Yapısı

```
src/
├── app/
│   ├── core/               # Temel servisler
│   │   ├── api/            # API servisi
│   │   ├── auth/           # Auth servisleri, guards, interceptors
│   │   └── websocket/      # WebSocket servisleri
│   ├── models/             # TypeScript interface'leri
│   ├── pages/              # Sayfa componentleri
│   │   ├── auth/           # Login, Register, 2FA (TAM)
│   │   ├── home/           # Ana sayfa (iskelet)
│   │   ├── articles/       # Haber listesi (iskelet)
│   │   ├── article-detail/ # Haber detay (iskelet)
│   │   ├── category/       # Kategori (iskelet)
│   │   ├── search/         # Arama (iskelet)
│   │   ├── profile/        # Profil (iskelet)
│   │   ├── notifications/  # Bildirimler (iskelet)
│   │   ├── bookmarks/      # Kaydedilenler (iskelet)
│   │   └── admin/          # Admin paneli (iskelet)
│   ├── services/           # Feature servisleri
│   ├── app.component.ts    # Ana component
│   ├── app.config.ts       # Uygulama konfigürasyonu
│   └── app.routes.ts       # Route tanımlamaları
└── environments/           # Environment ayarları
```

## ⚙️ Yapılandırma

### Environment Değişkenleri

`src/environments/environment.ts` dosyasını düzenleyin:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',  // Backend API URL
  wsUrl: 'ws://localhost:8000/ws',          // WebSocket URL
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID',
  facebookAppId: 'YOUR_FACEBOOK_APP_ID'
};
```

### Backend Entegrasyonu

Bu frontend, Django REST Framework backend ile çalışmak üzere tasarlanmıştır:

- API Endpoint: `http://localhost:8000/api/v1`
- WebSocket: `ws://localhost:8000/ws`

Backend projesini `/home/user/news_backend` dizininde bulabilirsiniz.

## 🔐 Kimlik Doğrulama Akışı

1. **Login**: Kullanıcı adı/şifre veya sosyal medya ile giriş
2. **2FA** (Opsiyonel): 6 haneli kod ile doğrulama
3. **Token Yönetimi**: Access token ve refresh token otomatik yönetilir
4. **Auto-Refresh**: Token süresi dolduğunda otomatik yenilenir
5. **WebSocket**: Giriş yapıldığında otomatik bağlanır

## 🔌 WebSocket Kullanımı

```typescript
// Bildirimler için
this.notificationWs.messages$.subscribe(message => {
  if (message.type === 'notification') {
    console.log('Yeni bildirim:', message.notification);
  }
});

// Son dakika haberleri için
this.breakingNewsWs.messages$.subscribe(message => {
  if (message.type === 'breaking_news') {
    console.log('Son dakika:', message.article);
  }
});
```

## 📝 Geliştirme Notları

### Tamamlanmış
- ✅ Tüm temel servisler
- ✅ TypeScript modelleri
- ✅ Auth sayfaları (Login, Register, 2FA)
- ✅ WebSocket entegrasyonu
- ✅ Token yönetimi
- ✅ Route guards
- ✅ HTTP interceptors
- ✅ Sosyal medya girişi

### Yapılacaklar
- ⏳ Ana sayfa UI implementasyonu
- ⏳ Haber listesi sayfası
- ⏳ Haber detay sayfası
- ⏳ Kategori sayfası
- ⏳ Arama sayfası
- ⏳ Profil sayfası
- ⏳ Bildirimler sayfası
- ⏳ Admin paneli

## 🎨 Stil Sistemi

Proje TailwindCSS kullanmaktadır. Özel utility sınıfları:

```css
.btn-primary      - Mavi buton
.btn-secondary    - Gri buton
.input-field      - Form input alanı
.card             - Kart container
```

## 🚀 Deployment

### Production Build

```bash
npm run build
```

Build çıktısı `dist/news-frontend-angular` klasöründe oluşturulur.

### Nginx Konfigürasyonu

```nginx
server {
    listen 80;
    server_name example.com;
    root /path/to/dist/news-frontend-angular/browser;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 📚 API Dökümanları

Backend API dökümanları:
- Swagger: `http://localhost:8000/swagger/`
- ReDoc: `http://localhost:8000/redoc/`

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

MIT License

## 🆘 Destek

Sorularınız için issue açabilirsiniz.
