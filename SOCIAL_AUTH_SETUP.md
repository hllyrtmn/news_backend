# Social Media Login Kurulum Rehberi

Bu dokümantasyon, Google, Facebook ve Twitter ile sosyal medya girişi için gerekli kurulum adımlarını içerir.

## 1. Google OAuth 2.0 Kurulumu

### Google Cloud Console'da Proje Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. "APIs & Services" > "Credentials" bölümüne gidin
4. "Create Credentials" > "OAuth client ID" seçin
5. Application type olarak "Web application" seçin
6. Authorized redirect URIs kısmına şunları ekleyin:
   ```
   http://localhost:8000/api/v1/auth/social/google/callback/
   https://yourdomain.com/api/v1/auth/social/google/callback/
   ```
7. Client ID ve Client Secret'i kopyalayın

### .env Dosyasına Ekleme

```env
GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
GOOGLE_OAUTH_SECRET=your_client_secret_here
```

## 2. Facebook Login Kurulumu

### Facebook Developers'da Uygulama Oluşturma

1. [Facebook Developers](https://developers.facebook.com/) adresine gidin
2. "My Apps" > "Create App" tıklayın
3. "Consumer" seçeneğini seçin
4. Uygulama adını girin ve oluşturun
5. Sol menüden "Settings" > "Basic" bölümüne gidin
6. App ID ve App Secret'i kopyalayın
7. "Add Platform" > "Website" seçin
8. Site URL'ini girin: `http://localhost:8000` veya `https://yourdomain.com`
9. "Facebook Login" > "Settings" bölümüne gidin
10. Valid OAuth Redirect URIs kısmına şunu ekleyin:
    ```
    http://localhost:8000/api/v1/auth/social/facebook/callback/
    https://yourdomain.com/api/v1/auth/social/facebook/callback/
    ```

### .env Dosyasına Ekleme

```env
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
```

## 3. Twitter OAuth Kurulumu

### Twitter Developer Portal'da Uygulama Oluşturma

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) adresine gidin
2. "Projects & Apps" > "Create App" tıklayın
3. Uygulama adını girin ve oluşturun
4. "App Settings" > "User authentication settings" bölümüne gidin
5. OAuth 2.0 ayarlarını yapılandırın
6. Callback URL kısmına şunu ekleyin:
   ```
   http://localhost:8000/api/v1/auth/social/twitter/callback/
   https://yourdomain.com/api/v1/auth/social/twitter/callback/
   ```
7. API Key ve API Secret Key'i kopyalayın

### .env Dosyasına Ekleme

```env
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
```

## 4. Django Admin'de Social Apps Yapılandırması

Uygulamayı çalıştırdıktan sonra Django Admin panelinden sosyal uygulamaları yapılandırmanız gerekir:

1. Admin paneline giriş yapın: `http://localhost:8000/admin/`
2. "Sites" > "Sites" bölümüne gidin
3. Domain name'i güncelleyin: `localhost:8000` veya `yourdomain.com`
4. "Social applications" > "Add social application" tıklayın
5. Her provider için (Google, Facebook, Twitter):
   - Provider seçin
   - Name girin (örn: "Google OAuth")
   - Client id ve Secret key girin (.env'den)
   - Available sites'tan sitenizi "Chosen sites"a taşıyın
   - Save edin

## 5. Frontend Entegrasyonu

### Google Login

```javascript
// Frontend'de Google Sign-In butonu
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:8000/api/v1/auth/social/google/login/';
};
```

### Facebook Login

```javascript
const handleFacebookLogin = () => {
  window.location.href = 'http://localhost:8000/api/v1/auth/social/facebook/login/';
};
```

### Twitter Login

```javascript
const handleTwitterLogin = () => {
  window.location.href = 'http://localhost:8000/api/v1/auth/social/twitter/login/';
};
```

## 6. API Endpoints

### Email Verification (Standart Kayıt)

- **Kayıt**: `POST /api/v1/auth/dj-rest-auth/registration/`
  ```json
  {
    "email": "user@example.com",
    "password1": "securepassword123",
    "password2": "securepassword123",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "reader"
  }
  ```

- **Email Doğrulama**: Kullanıcıya gönderilen emaildeki linke tıklanır
  - Format: `/api/v1/auth/dj-rest-auth/registration/verify-email/<key>/`

- **Email Yeniden Gönder**: `POST /api/v1/auth/dj-rest-auth/registration/resend-email/`
  ```json
  {
    "email": "user@example.com"
  }
  ```

### Password Reset

- **Şifre Sıfırlama Talebi**: `POST /api/v1/auth/dj-rest-auth/password/reset/`
  ```json
  {
    "email": "user@example.com"
  }
  ```

- **Şifre Sıfırlama Onayı**: `POST /api/v1/auth/dj-rest-auth/password/reset/confirm/`
  ```json
  {
    "uid": "...",
    "token": "...",
    "new_password1": "newsecurepassword123",
    "new_password2": "newsecurepassword123"
  }
  ```

### Social Login Endpoints

- **Google**:
  - Login URL: `/api/v1/auth/social/google/login/`
  - Callback: `/api/v1/auth/social/google/callback/`

- **Facebook**:
  - Login URL: `/api/v1/auth/social/facebook/login/`
  - Callback: `/api/v1/auth/social/facebook/callback/`

- **Twitter**:
  - Login URL: `/api/v1/auth/social/twitter/login/`
  - Callback: `/api/v1/auth/social/twitter/callback/`

## 7. Test Etme

### Email Verification Test (Development)

Development modunda email backend console olarak ayarlıdır, yani emailler konsola yazdırılır:

```bash
# Django development server'ı çalıştırın
python manage.py runserver

# Kayıt olduktan sonra konsoldaki email verification linkini kopyalayıp tarayıcıya yapıştırın
```

### Production Email Ayarları

Production'da gerçek email göndermek için `.env` dosyasını güncelleyin:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

**Not**: Gmail kullanıyorsanız, [App Password](https://myaccount.google.com/apppasswords) oluşturmanız gerekir.

## 8. Güvenlik Notları

- Production'da HTTPS kullanın
- API keys ve secrets'ları asla git'e commit etmeyin
- `.env` dosyasını `.gitignore`'a ekleyin
- CORS ayarlarını sadece güvendiğiniz domainlere açın
- Rate limiting aktif olduğundan emin olun

## 9. Sorun Giderme

### Email Gönderilmiyor

- `EMAIL_BACKEND` ayarını kontrol edin
- SMTP bilgilerinin doğru olduğundan emin olun
- Gmail için "Less secure app access" veya App Password kullanın

### Social Login Çalışmıyor

- Redirect URI'ların tam olarak eşleştiğinden emin olun
- Django Admin'de Social Application'ların doğru yapılandırıldığını kontrol edin
- Client ID ve Secret'ların doğru olduğundan emin olun

### CSRF Token Hatası

- CORS ayarlarını kontrol edin
- `CORS_ALLOW_CREDENTIALS = True` olduğundan emin olun
- Frontend'den cookie'lerin gönderildiğinden emin olun
