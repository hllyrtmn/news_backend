# Two-Factor Authentication (2FA) Kurulum ve Kullanım Rehberi

Bu dokümantasyon, TOTP (Time-based One-Time Password) tabanlı iki faktörlü kimlik doğrulama sisteminin kurulum ve kullanım rehberidir.

## Gereksinimler

Aşağıdaki Python paketlerinin requirements.txt'ye eklenmesi gerekir:

```
pyotp==2.9.0
qrcode[pil]==7.4.2
```

Kurulum:
```bash
pip install pyotp qrcode[pil]
```

## Veritabanı Migration

2FA için User modeline yeni alanlar eklendi. Migration'ı çalıştırın:

```bash
python manage.py makemigrations accounts
python manage.py migrate
```

## API Endpoints

### 1. 2FA Durumu Kontrolü

**GET** `/api/v1/auth/2fa/status/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "two_factor_enabled": false,
  "backup_codes_remaining": 0
}
```

---

### 2. 2FA Kurulum Başlatma

**POST** `/api/v1/auth/2fa/setup/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "backup_codes": [
    "A1B2C3D4",
    "E5F6G7H8",
    "I9J0K1L2",
    ...
  ],
  "message": "QR kodu tarayıcınıza okutun ve doğrulama kodunu girin"
}
```

**Kullanım:**
1. `qr_code` değerini frontend'de img tag'inde gösterin
2. Kullanıcı Google Authenticator, Authy, veya Microsoft Authenticator ile QR kodu okusun
3. `backup_codes` listesini kullanıcıya gösterin ve güvenli bir yerde saklamasını söyleyin
4. Authenticator app'den gelen 6 haneli kodu verify endpoint'ine gönderin

---

### 3. 2FA Kurulum Doğrulama

**POST** `/api/v1/auth/2fa/verify/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "code": "123456"
}
```

**Response (Success):**
```json
{
  "message": "İki faktörlü kimlik doğrulama başarıyla aktifleştirildi",
  "two_factor_enabled": true
}
```

**Response (Error):**
```json
{
  "error": "Geçersiz doğrulama kodu"
}
```

---

### 4. 2FA ile Giriş Yapma

**POST** `/api/v1/auth/login/`

**Body (2FA Aktif Olmayan Kullanıcı):**
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**Body (2FA Aktif Kullanıcı):**
```json
{
  "username": "user@example.com",
  "password": "password123",
  "totp_code": "123456"
}
```

**Response (2FA Gerekli):**
```json
{
  "totp_code": [
    "İki faktörlü kimlik doğrulama kodu gerekli"
  ],
  "requires_2fa": true
}
```

**Response (Başarılı):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbG...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbG...",
  "user": {
    "id": 1,
    "username": "user",
    "email": "user@example.com",
    "two_factor_enabled": true,
    ...
  }
}
```

---

### 5. 2FA Devre Dışı Bırakma

**POST** `/api/v1/auth/2fa/disable/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "password": "current_password",
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "İki faktörlü kimlik doğrulama devre dışı bırakıldı",
  "two_factor_enabled": false
}
```

---

## Backup Kodlar

Backup kodlar, kullanıcının telefonunu kaybetmesi durumunda hesabına erişim sağlaması için kullanılır.

- Her kullanıcı için 10 adet backup kod oluşturulur
- Backup kodlar 8 karakterlik hex stringlerdir (örn: A1B2C3D4)
- Her backup kod sadece bir kez kullanılabilir
- Kullanıldıktan sonra otomatik olarak silinir
- Backup kod, TOTP kodu yerine `totp_code` alanına gönderilebilir

**Backup Kod Kullanımı:**
```json
{
  "username": "user@example.com",
  "password": "password123",
  "totp_code": "A1B2C3D4"  // Backup kod
}
```

---

## Frontend Entegrasyonu

### React Örneği

```javascript
// 2FA Kurulum
const setup2FA = async () => {
  const response = await fetch('/api/v1/auth/2fa/setup/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    }
  });

  const data = await response.json();

  // QR kodu göster
  setQRCode(data.qr_code);

  // Backup kodları göster
  setBackupCodes(data.backup_codes);
};

// 2FA Doğrulama
const verify2FA = async (code) => {
  const response = await fetch('/api/v1/auth/2fa/verify/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code })
  });

  const data = await response.json();

  if (response.ok) {
    alert('2FA aktifleştirildi!');
  }
};

// 2FA ile Giriş
const loginWith2FA = async (username, password, totpCode) => {
  const response = await fetch('/api/v1/auth/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
      totp_code: totpCode  // Kullanıcı 2FA aktifse
    })
  });

  const data = await response.json();

  if (data.requires_2fa) {
    // Kullanıcıdan TOTP kodu iste
    showTOTPInput();
  } else {
    // Giriş başarılı
    saveTokens(data.access, data.refresh);
  }
};
```

---

## Güvenlik Notları

### 1. TOTP Secret Güvenliği
- TOTP secret database'de plain text olarak saklanır
- Production'da database encryption kullanın
- Veya Django'nun field encryption paketlerini kullanın (örn: django-encrypted-model-fields)

### 2. Rate Limiting
- 2FA endpoint'lerinde rate limiting aktif
- Brute force saldırılarına karşı koruma sağlar
- Settings'te ayarlanabilir:
  ```python
  'DEFAULT_THROTTLE_RATES': {
      'auth': '20/hour',  # 2FA dahil tüm auth işlemleri
  }
  ```

### 3. Session Güvenliği
- 2FA setup sırasında secret geçici olarak session'da saklanır
- Setup tamamlandıktan sonra session temizlenir
- Production'da Redis session backend kullanın

### 4. Backup Kod Güvenliği
- Backup kodlar hash'lenmeden saklanır (kullanıcı görmeli)
- Kullanıcıya güvenli bir yerde saklamasını söyleyin
- Her kod sadece bir kez kullanılabilir

---

## Test Etme

### Development Modunda Test

```python
# Django shell
python manage.py shell

from django.contrib.auth import get_user_model
from apps.accounts.two_factor import get_current_totp_code

User = get_user_model()
user = User.objects.get(username='testuser')

# Current TOTP code'u al
if user.two_factor_enabled:
    current_code = get_current_totp_code(user.totp_secret)
    print(f"Current TOTP code: {current_code}")
```

### Authenticator App'leri
- **Google Authenticator** (iOS & Android)
- **Authy** (iOS, Android, Desktop)
- **Microsoft Authenticator** (iOS & Android)
- **1Password** (Premium özellik)

---

## Sorun Giderme

### "Geçersiz doğrulama kodu" Hatası

**Olası Sebepler:**
1. Sunucu saati yanlış (TOTP zamana dayalıdır)
   - Çözüm: NTP ile sunucu saatini senkronize edin
2. Kod süresi dolmuş (30 saniye geçerli)
   - Çözüm: Yeni kod girin
3. Secret key yanlış
   - Çözüm: 2FA'yı devre dışı bırakıp yeniden kurun

### "Önce kurulum adımını tamamlayın" Hatası

**Sebep:** Session'da geçici secret yok

**Çözüm:**
1. `/2fa/setup/` endpoint'ini tekrar çağırın
2. QR kodu yeniden okutun
3. Kodu doğrulayın

### Telefon Kaybedildi / App Silindi

**Çözüm:**
1. Backup kod kullanarak giriş yapın
2. 2FA'yı devre dışı bırakın
3. Yeniden kurun

---

## Production Checklist

- [ ] `pyotp` ve `qrcode[pil]` kuruldu
- [ ] Database migration çalıştırıldı
- [ ] TOTP secret encryption eklendi (opsiyonel ama önerilen)
- [ ] Redis session backend yapılandırıldı
- [ ] Rate limiting aktif
- [ ] NTP ile sunucu saati senkronize
- [ ] Backup kod saklama prosedürü kullanıcılara anlatıldı
- [ ] 2FA recovery süreci dokümante edildi
- [ ] Admin panelinde 2FA durumu görünür

---

## Admin Panel

Django admin'de kullanıcının 2FA durumunu görebilir ve yönetebilirsiniz:

1. `/admin/` paneline gidin
2. Users bölümünden kullanıcıyı seçin
3. "Two factor enabled" alanını kontrol edin
4. Gerekirse TOTP secret'i resetleyebilirsiniz

**NOT:** Production'da admin panelinden TOTP secret'i manuel değiştirmeyin, kullanıcının authenticator app'i ile senkronize olmaz.
