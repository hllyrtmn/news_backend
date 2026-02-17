# NEWS BACKEND - JIRA BACKLOG DOKÜMANI

## Proje Durumu Özeti
- **Backend Fonksiyonellik:** %95 Tamamlandı ✅
- **Backend Production Hazırlığı:** %60 Tamamlandı ⚠️
- **Frontend:** %30 Tamamlandı ⚠️
- **Genel Proje Tamamlanma:** ~%65

## Tahmini Süre: 220-316 saat (5.5-8 hafta)

---

# EPIC 1: TEST ALTYAPISI VE KAPSAMı (KRİTİK)
**Öncelik:** P0 - Kritik
**Tahmini Süre:** 40-60 saat (5-8 gün)
**Açıklama:** Projenin production'a çıkması için mutlaka test coverage'ı olmalı. Şu anda %0 test coverage var.

## Story 1.1: Test Framework Kurulumu ve Yapılandırması
**Süre:** 1 gün (6-8 saat)

### Sub-task 1.1.1: Pytest ve Test Kütüphanelerinin Kurulumu
- [ ] pytest, pytest-django, pytest-cov, factory-boy, faker kurulumu
- [ ] pytest.ini dosyası oluşturulması
- [ ] conftest.py ana konfigürasyon dosyası
- [ ] Test klasör yapısının oluşturulması (tests/ dizini her app'te)
- [ ] .coveragerc dosyası yapılandırması
- **Kabul Kriterleri:** pytest çalışıyor, coverage raporu alınabiliyor

### Sub-task 1.1.2: Test Fixtures ve Factory'lerin Oluşturulması
- [ ] User factory (tüm user type'ları için)
- [ ] Article factory (tüm article type'ları için)
- [ ] Category, Tag, Comment factory'leri
- [ ] Media (Image, Video) factory'leri
- [ ] Common test fixtures (authenticated users, sample data)
- **Kabul Kriterleri:** Her model için factory mevcut ve çalışıyor

---

## Story 1.2: Accounts App Test Coverage
**Süre:** 2 gün (12-16 saat)

### Sub-task 1.2.1: User Model ve Authentication Testleri
- [ ] User model testleri (create, update, validation)
- [ ] User type testleri (admin, editor, author, subscriber, reader)
- [ ] JWT token testleri (generate, refresh, validate)
- [ ] Login/logout endpoint testleri
- [ ] Password change/reset testleri
- **Kabul Kriterleri:** accounts/models/tests/ coverage >80%

### Sub-task 1.2.2: Two-Factor Authentication ve Social Auth Testleri
- [ ] 2FA enable/disable testleri
- [ ] TOTP QR code generation testleri
- [ ] 2FA verify testleri
- [ ] Social auth flow testleri (mock providers)
- [ ] Email verification testleri
- **Kabul Kriterleri:** 2FA ve social auth coverage >80%

### Sub-task 1.2.3: User Profile ve Preferences Testleri
- [ ] Author profile CRUD testleri
- [ ] User preferences testleri
- [ ] Profile istatistik testleri
- [ ] User serializer testleri
- [ ] Permission testleri (role-based access)
- **Kabul Kriterleri:** Profile ve preferences coverage >80%

---

## Story 1.3: Articles App Test Coverage
**Süre:** 3 gün (18-24 saat)

### Sub-task 1.3.1: Article Model ve CRUD Testleri
- [ ] Article model testleri (tüm article type'ları)
- [ ] Article status workflow testleri (draft→pending→published→archived)
- [ ] Article CRUD endpoint testleri
- [ ] Article permission testleri (author vs editor vs admin)
- [ ] Slug generation ve uniqueness testleri
- **Kabul Kriterleri:** articles/models/tests/ coverage >80%

### Sub-task 1.3.2: Category, Tag ve Related Articles Testleri
- [ ] Category hierarchy testleri
- [ ] Tag CRUD ve trending tags testleri
- [ ] Related articles logic testleri
- [ ] Article revision testleri
- [ ] Featured/breaking/trending flag testleri
- **Kabul Kriterleri:** Category ve tag sistemi coverage >80%

### Sub-task 1.3.3: Article Search ve Filter Testleri
- [ ] Full-text search testleri
- [ ] Autocomplete testleri
- [ ] Filter testleri (category, tag, status, type)
- [ ] Pagination testleri
- [ ] Ordering testleri (date, views, rating)
- **Kabul Kriterleri:** Search ve filter coverage >80%

---

## Story 1.4: Comments, Interactions ve Media Test Coverage
**Süre:** 2 gün (12-16 saat)

### Sub-task 1.4.1: Comments ve Moderation Testleri
- [ ] Comment CRUD testleri
- [ ] Nested reply testleri
- [ ] Comment moderation testleri (spam detection, profanity)
- [ ] Like/dislike testleri
- [ ] Comment permission testleri
- **Kabul Kriterleri:** comments app coverage >80%

### Sub-task 1.4.2: Bookmarks, Reading History, Rating Testleri
- [ ] Bookmark CRUD testleri (with folders)
- [ ] Reading history tracking testleri
- [ ] Reading list testleri (public/private)
- [ ] Rating system testleri
- [ ] Interaction serializer testleri
- **Kabul Kriterleri:** interactions app coverage >80%

### Sub-task 1.4.3: Media Management Testleri
- [ ] Image upload ve thumbnail generation testleri
- [ ] Video upload testleri (YouTube, Vimeo, file)
- [ ] Gallery testleri
- [ ] Media metadata testleri
- [ ] File validation testleri
- **Kabul Kriterleri:** media app coverage >80%

---

## Story 1.5: Analytics, Ads, Notifications Test Coverage
**Süre:** 2 gün (12-16 saat)

### Sub-task 1.5.1: Analytics ve Reporting Testleri
- [ ] View tracking testleri (async)
- [ ] Popular articles calculation testleri
- [ ] Dashboard statistics testleri
- [ ] Author performance testleri
- [ ] Traffic metrics testleri
- **Kabul Kriterleri:** analytics app coverage >80%

### Sub-task 1.5.2: Advertisement System Testleri
- [ ] Ad campaign CRUD testleri
- [ ] Ad zone testleri (12 zone type)
- [ ] Targeting testleri (location, device, category)
- [ ] Impression ve click tracking testleri
- [ ] Budget management testleri
- **Kabul Kriterleri:** ads app coverage >80%

### Sub-task 1.5.3: Notification ve WebSocket Testleri
- [ ] Notification CRUD testleri
- [ ] WebSocket connection testleri
- [ ] Real-time notification delivery testleri
- [ ] Breaking news alert testleri
- [ ] Notification preferences testleri
- **Kabul Kriterleri:** notifications app coverage >80%

---

# EPIC 2: GÜVENLİK SERTLEŞTİRME (KRİTİK)
**Öncelik:** P0 - Kritik
**Tahmini Süre:** 8-12 saat (1-2 gün)
**Açıklama:** Production güvenlik açıkları kapatılmalı.

## Story 2.1: Email Verification ve Authentication Güvenliği
**Süre:** 1 gün (6-8 saat)

### Sub-task 2.1.1: Email Verification Mandatory Yapılması
- [ ] settings.py'da ACCOUNT_EMAIL_VERIFICATION = 'mandatory' yapılması
- [ ] Email verification template'lerinin oluşturulması
- [ ] Verification email gönderimi testleri
- [ ] Unverified user'ların endpoint'lere erişimi engellenmesi
- [ ] Resend verification email endpoint'i
- **Kabul Kriterleri:** Verify olmadan kullanıcı sisteme giremez

### Sub-task 2.1.2: Rate Limiting ve CAPTCHA Eklenmesi
- [ ] Registration endpoint'ine rate limit (5/hour per IP)
- [ ] Login endpoint'ine rate limit (10/hour per IP)
- [ ] Password reset'e rate limit (3/hour per IP)
- [ ] django-recaptcha kurulumu ve yapılandırması
- [ ] Contact form ve public endpoint'lere CAPTCHA eklenmesi
- **Kabul Kriterleri:** Brute force saldırılara karşı korumalı

### Sub-task 2.1.3: SECRET_KEY ve Sensitive Data Güvenliği
- [ ] Insecure SECRET_KEY default'unun kaldırılması
- [ ] Production'da SECRET_KEY zorunlu kontrolü
- [ ] .env.example dosyasının güncellenmesi
- [ ] Sensitive data'nın environment variable kontrolü
- [ ] Startup'ta security check scripti
- **Kabul Kriterleri:** Secret key güvenli şekilde yönetiliyor

---

## Story 2.2: Security Headers ve Brute Force Protection
**Süre:** 1 gün (6-8 saat)

### Sub-task 2.2.1: Security Headers Middleware Eklenmesi
- [ ] django-csp kurulumu ve yapılandırması
- [ ] Content Security Policy headers
- [ ] HSTS (HTTP Strict Transport Security) headers
- [ ] X-Frame-Options, X-Content-Type-Options headers
- [ ] Referrer-Policy yapılandırması
- **Kabul Kriterleri:** Security headers response'larda mevcut

### Sub-task 2.2.2: Brute Force ve IP-Based Protection
- [ ] django-defender kurulumu
- [ ] Failed login attempt tracking
- [ ] IP-based blocking yapılandırması
- [ ] Whitelist/blacklist IP yönetimi
- [ ] Admin panel'e defender integration
- **Kabul Kriterleri:** 5 failed attempt sonrası IP bloklanıyor

### Sub-task 2.2.3: Session ve Cookie Security Hardening
- [ ] SESSION_COOKIE_SECURE = True (production)
- [ ] SESSION_COOKIE_HTTPONLY = True
- [ ] CSRF_COOKIE_SECURE = True (production)
- [ ] SESSION_COOKIE_SAMESITE = 'Strict'
- [ ] Session timeout yapılandırması (2 hafta)
- **Kabul Kriterleri:** Cookie'ler güvenli flag'lerle set ediliyor

---

# EPIC 3: ERROR HANDLING VE LOGGING (KRİTİK)
**Öncelik:** P0 - Kritik
**Tahmini Süre:** 12-16 saat (2 gün)
**Açıklama:** Production'da hataların yakalanması ve loglanması.

## Story 3.1: Comprehensive Error Handling
**Süre:** 1 gün (6-8 saat)

### Sub-task 3.1.1: Global Exception Handler ve Custom Error Pages
- [ ] Custom exception handler genişletilmesi
- [ ] Tüm API endpoint'lerine try/except eklenmesi (öncelik: articles, accounts)
- [ ] Custom error response formatı standardizasyonu
- [ ] 400, 401, 403, 404, 500 custom error pages
- [ ] Error response testleri
- **Kabul Kriterleri:** Tüm endpoint'ler graceful error handling yapıyor

### Sub-task 3.1.2: Input Validation ve Sanitization
- [ ] File upload size limit'leri (image: 5MB, video: 100MB)
- [ ] Request payload size limit
- [ ] HTML content sanitization (bleach kütüphanesi)
- [ ] URL validation ve sanitization
- [ ] Serializer validation'ların güçlendirilmesi
- **Kabul Kriterleri:** Kötü niyetli input'lar yakalanıyor

---

## Story 3.2: Logging Infrastructure ve Sentry Integration
**Süre:** 1 gün (6-8 saat)

### Sub-task 3.2.1: Centralized Logging Yapılandırması
- [ ] Python logging konfigürasyonu (settings.py)
- [ ] Log level'ları (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- [ ] Rotating file handler (günlük 100MB, 30 gün retention)
- [ ] Structured logging (JSON format)
- [ ] App-specific logger'lar (accounts, articles, analytics vb.)
- **Kabul Kriterleri:** Her app log dosyasına düzgün yazıyor

### Sub-task 3.2.2: Sentry Error Tracking Integration
- [ ] sentry-sdk kurulumu
- [ ] Sentry DSN yapılandırması (environment variable)
- [ ] Error context eklenmesi (user, request data)
- [ ] Breadcrumbs yapılandırması
- [ ] Performance monitoring aktifleştirilmesi
- **Kabul Kriterleri:** Production hataları Sentry'ye düşüyor

### Sub-task 3.2.3: Audit Logging ve Security Events
- [ ] User login/logout audit logging
- [ ] Failed authentication attempt logging
- [ ] Permission denied event logging
- [ ] Data modification audit trail (kim ne değiştirdi)
- [ ] Security-critical action'ların ayrı log dosyası
- **Kabul Kriterleri:** Security event'ler tracked ve loglanıyor

---

# EPIC 4: CELERY BEAT VE BACKGROUND TASKS (KRİTİK)
**Öncelik:** P0 - Kritik
**Tahmini Süre:** 2-4 saat (0.5 gün)
**Açıklama:** Periyodik task'ler yapılandırılmalı.

## Story 4.1: Celery Beat Schedule Yapılandırması
**Süre:** 0.5 gün (3-4 saat)

### Sub-task 4.1.1: Celery Beat Schedule Eklenmesi
- [ ] CELERY_BEAT_SCHEDULE sözlüğü settings.py'a eklenmesi
- [ ] update_popular_articles (her 30 dakika)
- [ ] cleanup_old_views (her gece 02:00)
- [ ] update_trending_tags (her 15 dakika)
- [ ] update_author_statistics (her saat)
- [ ] generate_daily_report (her gün 08:00)
- [ ] cleanup_expired_ads (her gece 03:00)
- [ ] send_pending_notifications (her 5 dakika)
- **Kabul Kriterleri:** Tüm periodic task'ler zamanında çalışıyor

### Sub-task 4.1.2: Celery Beat Test ve Monitoring
- [ ] Celery beat servisinin docker-compose'a eklenmesi
- [ ] Beat schedule'un lokal ortamda test edilmesi
- [ ] Task failure handling ve retry policy
- [ ] Task execution monitoring (Flower veya Django admin)
- [ ] Dead letter queue yapılandırması
- **Kabul Kriterleri:** Beat tasks monitör edilebiliyor ve çalışıyor

---

# EPIC 5: FRONTEND IMPLEMENTATION (YÜKSEK ÖNCELİK)
**Öncelik:** P1 - Yüksek
**Tahmini Süre:** 80-120 saat (10-15 gün)
**Açıklama:** Frontend sayfaları skeleton'dan çıkartılıp tamamlanmalı.

## Story 5.1: Home Page Implementation
**Süre:** 2 gün (12-16 saat)

### Sub-task 5.1.1: Home Page Hero Section ve Featured Articles
- [ ] Hero slider component (breaking news)
- [ ] Featured articles grid layout
- [ ] Trending articles sidebar component
- [ ] Latest articles infinite scroll
- [ ] Category quick navigation
- **Kabul Kriterleri:** Ana sayfa temel layoutu çalışıyor

### Sub-task 5.1.2: Home Page Widgets ve Sidebar
- [ ] Most read articles widget
- [ ] Editor's pick widget
- [ ] Category boxes widget
- [ ] Newsletter subscription widget
- [ ] Advertisement placements (header, sidebar, footer)
- **Kabul Kriterleri:** Ana sayfa widget'ları backend'den veri çekiyor

### Sub-task 5.1.3: Home Page Responsive ve Performance
- [ ] Mobile responsive design
- [ ] Tablet layout optimizasyonu
- [ ] Image lazy loading
- [ ] Infinite scroll pagination
- [ ] Loading skeletons ve shimmer effects
- **Kabul Kriterleri:** Ana sayfa mobilde ve masaüstünde düzgün görünüyor

---

## Story 5.2: Article List ve Category Pages
**Süre:** 2 gün (12-16 saat)

### Sub-task 5.2.1: Article List Page ve Filtering
- [ ] Article card component (image, title, excerpt, author)
- [ ] Filter sidebar (category, tag, date, type)
- [ ] Sort options (latest, popular, trending)
- [ ] Pagination veya infinite scroll
- [ ] Empty state ve loading states
- **Kabul Kriterleri:** Makale listesi filtreleme ile çalışıyor

### Sub-task 5.2.2: Category Page Layout
- [ ] Category header ve description
- [ ] Subcategory navigation
- [ ] Category article list
- [ ] Related categories sidebar
- [ ] Category statistics (article count, followers)
- **Kabul Kriterleri:** Kategori sayfası backend'den veri çekiyor

### Sub-task 5.2.3: Search Results Page
- [ ] Search input component (autocomplete)
- [ ] Search results list
- [ ] Search filters (type, category, date range)
- [ ] "Did you mean?" suggestions
- [ ] No results state
- **Kabul Kriterleri:** Arama çalışıyor ve sonuçlar listeleniyor

---

## Story 5.3: Article Detail Page
**Süre:** 3 gün (18-24 saat)

### Sub-task 5.3.1: Article Content ve Metadata Display
- [ ] Article header (title, author, date, category)
- [ ] Featured image display
- [ ] Rich text content rendering (CKEditor output)
- [ ] Video embed (YouTube, Vimeo)
- [ ] Gallery lightbox component
- **Kabul Kriterleri:** Makale içeriği düzgün görüntüleniyor

### Sub-task 5.3.2: Article Interactions (Comments, Rating, Share)
- [ ] Comments section (list, post, reply)
- [ ] Comment like/dislike
- [ ] Rating component (stars)
- [ ] Share buttons (social media)
- [ ] Bookmark button
- [ ] Reading progress bar
- **Kabul Kriterleri:** Kullanıcı makale ile etkileşime geçebiliyor

### Sub-task 5.3.3: Article Sidebar ve Related Content
- [ ] Author card ve follow button
- [ ] Related articles component
- [ ] Table of contents (headings navigation)
- [ ] Tags display ve tag navigation
- [ ] Ad placements (in-article, sidebar)
- **Kabul Kriterleri:** İlgili içerik ve yazar bilgisi gösteriliyor

---

## Story 5.4: User Profile Pages
**Süre:** 2 gün (12-16 saat)

### Sub-task 5.4.1: Profile Overview ve Settings
- [ ] Profile header (avatar, name, bio, stats)
- [ ] Profile edit form
- [ ] Password change form
- [ ] Email preferences
- [ ] 2FA enable/disable UI
- **Kabul Kriterleri:** Kullanıcı profilini düzenleyebiliyor

### Sub-task 5.4.2: Bookmarks ve Reading History Pages
- [ ] Bookmarks list (with folders)
- [ ] Bookmark add/remove functionality
- [ ] Reading history timeline
- [ ] Reading lists (create, edit, share)
- [ ] Filter ve search bookmarks
- **Kabul Kriterleri:** Bookmark ve geçmiş yönetimi çalışıyor

### Sub-task 5.4.3: Notifications Page
- [ ] Notification list (grouped by date)
- [ ] Mark as read/unread
- [ ] Notification preferences
- [ ] Real-time notification toast
- [ ] Notification badge counter
- **Kabul Kriterleri:** Bildirimler real-time çalışıyor

---

## Story 5.5: Author Dashboard ve Admin Panel Verification
**Süre:** 2 gün (12-16 saat)

### Sub-task 5.5.1: Author Dashboard Pages
- [ ] Dashboard overview (stats, charts)
- [ ] My articles list (draft, published, archived)
- [ ] Create/edit article page
- [ ] Article preview
- [ ] Performance analytics (views, engagement)
- **Kabul Kriterleri:** Yazar kendi makalelerini yönetebiliyor

### Sub-task 5.5.2: Admin Panel Feature Verification
- [ ] Admin panel'in tüm sayfalarının testi
- [ ] User management sayfası
- [ ] Content moderation sayfası
- [ ] Ad management sayfası
- [ ] Analytics dashboard
- **Kabul Kriterleri:** Admin panel tüm fonksiyonlar çalışıyor

### Sub-task 5.5.3: Mobile App UI/UX Polish
- [ ] Touch interaction optimizasyonu
- [ ] Mobile menu ve navigation
- [ ] Pull-to-refresh
- [ ] Offline state handling
- [ ] App-like animations
- **Kabul Kriterleri:** Mobil deneyim smooth ve native-like

---

# EPIC 6: EMAIL SYSTEM VE NOTIFICATIONS (YÜKSEK ÖNCELİK)
**Öncelik:** P1 - Yüksek
**Tahmini Süre:** 12-16 saat (2 gün)
**Açıklama:** Email gönderimi test edilip template'ler oluşturulmalı.

## Story 6.1: Email Templates ve Sending Infrastructure
**Süre:** 1 gün (6-8 saat)

### Sub-task 6.1.1: Email Templates Oluşturulması
- [ ] Verification email template (HTML + text)
- [ ] Password reset email template
- [ ] Welcome email template
- [ ] Newsletter email template
- [ ] Comment notification email template
- [ ] Base email template (header, footer, styling)
- **Kabul Kriterleri:** Tüm email'ler brand'e uygun ve responsive

### Sub-task 6.1.2: Email Sending Configuration ve Testing
- [ ] SMTP settings doğrulaması (Gmail, SendGrid, veya AWS SES)
- [ ] Email backend'in test edilmesi
- [ ] Email retry logic (failed email'ler için)
- [ ] Email delivery tracking (isteğe bağlı)
- [ ] Email preview endpoint'i (development için)
- **Kabul Kriterleri:** Email'ler başarıyla gönderiliyor

---

## Story 6.2: Push Notifications Implementation
**Süre:** 1 gün (6-8 saat)

### Sub-task 6.2.1: Web Push Notifications Setup
- [ ] Service worker oluşturulması
- [ ] Push subscription management
- [ ] VAPID keys generation ve yapılandırma
- [ ] Browser notification permission request UI
- [ ] Push notification payload standardı
- **Kabul Kriterleri:** Web push notifications çalışıyor

### Sub-task 6.2.2: Push Notification Triggers ve Preferences
- [ ] Breaking news push trigger
- [ ] Comment reply push trigger
- [ ] Author follow push trigger
- [ ] User notification preferences UI
- [ ] Notification frequency control (immediate, daily digest)
- **Kabul Kriterleri:** Kullanıcı notification tercihlerini yönetebiliyor

---

# EPIC 7: MONITORING, LOGGING VE DEVOPS (YÜKSEK ÖNCELİK)
**Öncelik:** P1 - Yüksek
**Tahmini Süre:** 16-20 saat (2-3 gün)
**Açıklama:** Production monitoring ve health check'ler.

## Story 7.1: Health Checks ve Status Endpoints
**Süre:** 0.5 gün (3-4 saat)

### Sub-task 7.1.1: Health Check Endpoints
- [ ] /health/ endpoint (basic health check)
- [ ] /health/db/ endpoint (database connectivity)
- [ ] /health/redis/ endpoint (cache connectivity)
- [ ] /health/celery/ endpoint (celery worker status)
- [ ] /status/ endpoint (version, uptime, stats)
- **Kabul Kriterleri:** Load balancer health check'lerde kullanılabilir

### Sub-task 7.1.2: Readiness ve Liveness Probes
- [ ] Kubernetes readiness probe endpoint
- [ ] Kubernetes liveness probe endpoint
- [ ] Startup probe endpoint
- [ ] Graceful shutdown handling
- [ ] Health check testleri
- **Kabul Kriterleri:** K8s probes düzgün çalışıyor

---

## Story 7.2: APM ve Performance Monitoring
**Süre:** 1 gün (6-8 saat)

### Sub-task 7.2.1: APM Tool Integration (New Relic veya DataDog)
- [ ] APM agent kurulumu
- [ ] Transaction tracing yapılandırması
- [ ] Custom instrumentation (critical endpoints)
- [ ] Database query monitoring
- [ ] External service call tracking
- **Kabul Kriterleri:** APM dashboard'da metrikler görünüyor

### Sub-task 7.2.2: Database Query Performance Monitoring
- [ ] django-silk production'da disable, development'ta enable
- [ ] Slow query logging (>100ms)
- [ ] Query analysis için script'ler
- [ ] N+1 query detection
- [ ] Query optimization önerileri dökümanı
- **Kabul Kriterleri:** Slow query'ler tespit edilebiliyor

---

## Story 7.3: Metrics Collection ve Alerting
**Süre:** 1 gün (6-8 saat)

### Sub-task 7.3.1: Prometheus Metrics Exporter
- [ ] django-prometheus kurulumu
- [ ] Custom metrics (articles published, users registered)
- [ ] Business metrics (ad impressions, revenue)
- [ ] Celery task metrics
- [ ] /metrics endpoint'i
- **Kabul Kriterleri:** Prometheus metrics expose ediliyor

### Sub-task 7.3.2: Grafana Dashboard Setup (opsiyonel)
- [ ] Grafana kurulumu (docker-compose)
- [ ] Dashboard template'leri
- [ ] API performance dashboard
- [ ] Business metrics dashboard
- [ ] Celery tasks dashboard
- **Kabul Kriterleri:** Grafana'da metrikler görselleştiriliyor

### Sub-task 7.3.3: Alerting Rules ve Notifications
- [ ] High error rate alert (>5% 5xx errors)
- [ ] Slow response time alert (p95 >1s)
- [ ] Database connection pool alert
- [ ] Celery queue length alert (>1000)
- [ ] Disk space alert (<10% free)
- **Kabul Kriterleri:** Critical alert'ler Slack/email'e düşüyor

---

# EPIC 8: DOCUMENTATION VE DEPLOYMENT GUIDE (YÜKSEK ÖNCELİK)
**Öncelik:** P1 - Yüksek
**Tahmini Süre:** 12-16 saat (2 gün)
**Açıklama:** Deployment ve developer documentation.

## Story 8.1: Deployment Documentation
**Süre:** 1 gün (6-8 saat)

### Sub-task 8.1.1: Production Deployment Guide
- [ ] Server requirements dökümanı (CPU, RAM, disk)
- [ ] SSL/HTTPS setup detayları (Let's Encrypt)
- [ ] Load balancer yapılandırması (Nginx/HAProxy)
- [ ] Database replication setup (master-slave)
- [ ] Redis sentinel/cluster setup
- [ ] Static files ve media serving (CDN veya S3)
- **Kabul Kriterleri:** Deployment guide'ı takip edilebilir

### Sub-task 8.1.2: Environment Variables ve Configuration
- [ ] Tüm environment variable'ların listesi
- [ ] .env.example güncellemesi
- [ ] Development, staging, production config farklılıkları
- [ ] Secret management best practices
- [ ] Configuration validation script'i
- **Kabul Kriterleri:** Tüm config değişkenleri dokümante

### Sub-task 8.1.3: Backup ve Disaster Recovery Guide
- [ ] Database backup strategy (daily full, hourly incremental)
- [ ] Media files backup strategy
- [ ] Backup restore prosedürü
- [ ] Disaster recovery plan
- [ ] RTO ve RPO hedefleri
- **Kabul Kriterleri:** Backup/restore prosedürü test edilmiş

---

## Story 8.2: Developer Documentation
**Süre:** 1 gün (6-8 saat)

### Sub-task 8.2.1: API Documentation Enhancement
- [ ] Swagger dökümanının gözden geçirilmesi
- [ ] Her endpoint için example request/response
- [ ] Authentication örnekleri (JWT token usage)
- [ ] Error response formatları
- [ ] Postman collection export
- **Kabul Kriterleri:** API docs complete ve anlaşılır

### Sub-task 8.2.2: Contributing Guide ve Code Standards
- [ ] CONTRIBUTING.md oluşturulması
- [ ] Code style guide (PEP 8, naming conventions)
- [ ] Git branch strategy (gitflow)
- [ ] Pull request template
- [ ] Issue template'leri
- [ ] Code review checklist
- **Kabul Kriterleri:** Yeni developer onboard olabiliyor

### Sub-task 8.2.3: Architecture Documentation
- [ ] System architecture diagram (C4 model)
- [ ] Database schema diagram
- [ ] API architecture açıklaması
- [ ] WebSocket architecture
- [ ] Celery task flow diagram
- [ ] Technology stack ve dependencies
- **Kabul Kriterleri:** Architecture anlaşılabilir

---

# EPIC 9: CODE QUALITY VE CI/CD (ORTA ÖNCELİK)
**Öncelik:** P2 - Orta
**Tahmini Süre:** 8-12 saat (1-2 gün)
**Açıklama:** Code quality tools ve CI/CD pipeline.

## Story 9.1: Code Quality Tools Setup
**Süre:** 1 gün (6-8 saat)

### Sub-task 9.1.1: Linting ve Formatting Tools
- [ ] black (code formatter) kurulumu
- [ ] isort (import sorter) kurulumu
- [ ] flake8 (linter) kurulumu ve yapılandırması
- [ ] pylint kurulumu (isteğe bağlı)
- [ ] pyproject.toml veya setup.cfg yapılandırması
- **Kabul Kriterleri:** Code formatting standardize

### Sub-task 9.1.2: Pre-commit Hooks
- [ ] pre-commit framework kurulumu
- [ ] .pre-commit-config.yaml oluşturulması
- [ ] black, isort, flake8 hook'ları
- [ ] trailing whitespace, end-of-file fixer
- [ ] Test runner hook (pre-push)
- **Kabul Kriterleri:** Commit'ten önce code check'ler çalışıyor

### Sub-task 9.1.3: Code Quality Fixes
- [ ] Tüm codebase'de black çalıştırılması
- [ ] isort ile import'ların düzenlenmesi
- [ ] flake8 warning'lerinin düzeltilmesi
- [ ] TODO comment'lerinin issue'ya dönüştürülmesi
- [ ] Dead code'un temizlenmesi
- **Kabul Kriterleri:** Linter warning'i yok

---

## Story 9.2: CI/CD Pipeline Setup
**Süre:** 1 gün (6-8 saat)

### Sub-task 9.2.1: GitHub Actions Workflow
- [ ] .github/workflows/ci.yml oluşturulması
- [ ] Test workflow (her PR'da pytest)
- [ ] Linting workflow (black, flake8)
- [ ] Security scan workflow (bandit, safety)
- [ ] Coverage report workflow
- **Kabul Kriterleri:** Her PR'da otomatik test çalışıyor

### Sub-task 9.2.2: Deployment Workflow
- [ ] Staging deployment workflow (dev branch)
- [ ] Production deployment workflow (main branch)
- [ ] Docker image build ve push
- [ ] Database migration otomasyonu
- [ ] Rollback strategy
- **Kabul Kriterleri:** Push sonrası otomatik deploy

### Sub-task 9.2.3: Staging Environment Setup
- [ ] Staging server yapılandırması
- [ ] Staging database setup
- [ ] Staging domain ve SSL
- [ ] Staging'e otomatik deployment
- [ ] Smoke test'ler (health check, critical endpoints)
- **Kabul Kriterleri:** Staging environment çalışıyor

---

# EPIC 10: PERFORMANCE OPTIMIZATION (ORTA ÖNCELİK)
**Öncelik:** P2 - Orta
**Tahmini Süre:** 12-16 saat (2 gün)
**Açıklama:** Performance bottleneck'lerinin çözümü.

## Story 10.1: Database Query Optimization
**Süre:** 1 gün (6-8 saat)

### Sub-task 10.1.1: N+1 Query Problemlerinin Çözümü
- [ ] Article list view'da select_related/prefetch_related
- [ ] Comment list'te nested reply N+1'lerin çözümü
- [ ] Dashboard statistics'te query optimization
- [ ] Related articles query optimization
- [ ] Queryset profiling ve optimization
- **Kabul Kriterleri:** N+1 query'ler eliminate edildi

### Sub-task 10.1.2: Database Index Optimization
- [ ] Missing index'lerin tespit edilmesi
- [ ] Foreign key'lerde index kontrolü
- [ ] Sık kullanılan filter field'larda index
- [ ] Composite index'lerin eklenmesi
- [ ] Index usage analysis
- **Kabul Kriterleri:** Kritik query'ler index kullanıyor

### Sub-task 10.1.3: Database Connection Pooling
- [ ] PgBouncer kurulumu (PostgreSQL)
- [ ] Connection pool settings optimization
- [ ] Connection leak detection
- [ ] Connection timeout ayarları
- [ ] Pool monitoring
- **Kabul Kriterleri:** Connection pool verimli çalışıyor

---

## Story 10.2: Caching Strategy Enhancement
**Süre:** 1 gün (6-8 saat)

### Sub-task 10.2.1: Redis Cache Optimization
- [ ] Cache key naming convention standardizasyonu
- [ ] Cache TTL stratejisinin gözden geçirilmesi
- [ ] Cache miss handling optimization
- [ ] Cache warming stratejisi (popüler içerik)
- [ ] Cache hit rate monitoring
- **Kabul Kriterleri:** Cache hit rate >80%

### Sub-task 10.2.2: View-Level Caching
- [ ] Article detail view caching (5 dakika)
- [ ] Category list caching (10 dakika)
- [ ] Tag cloud caching (15 dakika)
- [ ] Popular articles caching (30 dakika)
- [ ] Cache invalidation on update
- **Kabul Kriterleri:** View cache'leri çalışıyor

### Sub-task 10.2.3: CDN Setup for Static and Media Files
- [ ] CDN provider seçimi (CloudFlare, AWS CloudFront, Bunny CDN)
- [ ] Static files CDN'e upload
- [ ] Media files CDN integration
- [ ] CORS yapılandırması
- [ ] Cache-Control headers
- **Kabul Kriterleri:** Static/media files CDN'den serve ediliyor

---

# EPIC 11: SOCIAL AUTH VE THIRD-PARTY INTEGRATIONS (ORTA ÖNCELİK)
**Öncelik:** P2 - Orta
**Tahmini Süre:** 4-8 saat (1 gün)
**Açıklama:** Social login ve external service integration.

## Story 11.1: Social Authentication Setup
**Süre:** 1 gün (6-8 saat)

### Sub-task 11.1.1: Google OAuth Setup
- [ ] Google Cloud Console'da OAuth app oluşturma guide'ı
- [ ] Google OAuth credentials configuration
- [ ] Google login flow test
- [ ] Google profile data mapping
- [ ] Error handling (cancelled login, invalid token)
- **Kabul Kriterleri:** Google login çalışıyor

### Sub-task 11.1.2: Facebook ve Twitter OAuth Setup
- [ ] Facebook Developer'da app oluşturma guide'ı
- [ ] Twitter Developer'da app oluşturma guide'ı
- [ ] Facebook/Twitter login flow test
- [ ] Profile data mapping
- [ ] Social account linking (existing user)
- **Kabul Kriterleri:** Facebook ve Twitter login çalışıyor

### Sub-task 11.1.3: Social Auth Error Handling ve UX
- [ ] Social login error mesajları
- [ ] Account conflict handling (email already exists)
- [ ] Social account disconnection
- [ ] Multiple social account linking
- [ ] Social login analytics
- **Kabul Kriterleri:** Social login user-friendly

---

# EPIC 12: BACKUP STRATEGY VE DATA MANAGEMENT (ORTA ÖNCELİK)
**Öncelik:** P2 - Orta
**Tahmini Süre:** 6-8 saat (1 gün)
**Açıklama:** Automated backup ve data lifecycle management.

## Story 12.1: Automated Backup Implementation
**Süre:** 1 gün (6-8 saat)

### Sub-task 12.1.1: Database Backup Automation
- [ ] pg_dump script'i (PostgreSQL)
- [ ] Daily full backup + hourly incremental
- [ ] Backup compression (gzip)
- [ ] Backup retention policy (30 gün full, 7 gün incremental)
- [ ] Off-site backup (S3, BackBlaze, Google Cloud Storage)
- **Kabul Kriterleri:** Günlük otomatik backup çalışıyor

### Sub-task 12.1.2: Media Files Backup
- [ ] Media folder backup script'i (rsync veya rclone)
- [ ] Incremental media backup
- [ ] S3 veya object storage sync
- [ ] Backup verification (checksum)
- [ ] Backup size monitoring
- **Kabul Kriterleri:** Media files yedekleniyor

### Sub-task 12.1.3: Backup Restore Testing
- [ ] Database restore prosedürü
- [ ] Media restore prosedürü
- [ ] Restore test script'i
- [ ] Quarterly restore drill
- [ ] Restore time measurement
- **Kabul Kriterleri:** Backup'tan restore edilebiliyor

---

# EPIC 13: ADVANCED FEATURES VE ENHANCEMENTS (DÜŞÜK ÖNCELİK)
**Öncelik:** P3 - Düşük
**Tahmini Süre:** 40-60 saat (5-8 gün)
**Açıklama:** Nice-to-have features.

## Story 13.1: Content Recommendation Engine
**Süre:** 2 gün (12-16 saat)

### Sub-task 13.1.1: Collaborative Filtering Recommendation
- [ ] User reading history analysis
- [ ] Similar user finding (cosine similarity)
- [ ] Recommendation algorithm implementation
- [ ] Recommendation caching
- [ ] "Recommended for you" widget
- **Kabul Kriterleri:** Kullanıcıya önerilmiş makaleler gösteriliyor

### Sub-task 13.1.2: Content-Based Recommendation
- [ ] Article similarity calculation (tags, category)
- [ ] TF-IDF veya word2vec kullanımı
- [ ] "Similar articles" algorithm improvement
- [ ] Real-time recommendation update
- [ ] A/B testing framework
- **Kabul Kriterleri:** İlgili içerik önerileri akıllı

---

## Story 13.2: Advanced Analytics Dashboard
**Süre:** 2 gün (12-16 saat)

### Sub-task 13.2.1: Real-time Analytics Dashboard
- [ ] Real-time visitor counter (WebSocket)
- [ ] Live article view counter
- [ ] Geographic distribution map
- [ ] Device/browser breakdown charts
- [ ] Traffic source analysis
- **Kabul Kriterleri:** Admin real-time analytics görebiliyor

### Sub-task 13.2.2: Author Performance Analytics
- [ ] Author engagement metrics (avg. read time, completion rate)
- [ ] Follower growth chart
- [ ] Article performance comparison
- [ ] Best performing content analysis
- [ ] Earnings projection (ad revenue share)
- **Kabul Kriterleri:** Author kendi performansını görebiliyor

---

## Story 13.3: A/B Testing Framework
**Süre:** 2 gün (12-16 saat)

### Sub-task 13.3.1: A/B Test Infrastructure
- [ ] Experiment model (name, variants, metrics)
- [ ] User assignment logic (consistent hashing)
- [ ] Variant serving middleware
- [ ] Event tracking (conversions, clicks)
- [ ] Statistical significance calculation
- **Kabul Kriterleri:** A/B test framework çalışıyor

### Sub-task 13.3.2: A/B Test Dashboard ve Reporting
- [ ] Active experiments list
- [ ] Variant performance comparison
- [ ] Confidence interval visualization
- [ ] Winner declaration
- [ ] Test history ve learnings
- **Kabul Kriterleri:** A/B test sonuçları analiz edilebiliyor

---

## Story 13.4: Admin Panel Enhancements
**Süre:** 2 gün (12-16 saat)

### Sub-task 13.4.1: Bulk Operations
- [ ] Bulk article status change
- [ ] Bulk category assignment
- [ ] Bulk tag management
- [ ] Bulk user actions (ban, unban)
- [ ] Bulk delete with confirmation
- **Kabul Kriterleri:** Admin bulk işlem yapabiliyor

### Sub-task 13.4.2: Content Scheduling
- [ ] Scheduled publish date/time picker
- [ ] Scheduled unpublish (auto-archive)
- [ ] Schedule queue display
- [ ] Edit scheduled content
- [ ] Cancel scheduled publish
- **Kabul Kriterleri:** İçerik ileride publish için planlanabiliyor

---

## Story 13.5: Migration Squashing ve Database Optimization
**Süre:** 0.5 gün (3-4 saat)

### Sub-task 13.5.1: Migration Squashing
- [ ] Her app için migration squashing
- [ ] Squashed migration testleri
- [ ] Migration history cleanup
- [ ] Fresh database'de migration test
- [ ] Deployment guide update
- **Kabul Kriterleri:** Migration sayısı azaltıldı

---

# ÖZET: İŞ DAĞILIMI VE ÖNCELIKLER

## Kritik (Production Blocker) - 5.5-8 Hafta
1. **EPIC 1:** Test Altyapısı (5-8 gün)
2. **EPIC 2:** Güvenlik Sertleştirme (1-2 gün)
3. **EPIC 3:** Error Handling ve Logging (2 gün)
4. **EPIC 4:** Celery Beat (0.5 gün)
5. **EPIC 5:** Frontend Implementation (10-15 gün)

**Toplam Kritik:** 18.5-27.5 gün = ~**4-5.5 hafta**

---

## Yüksek Öncelik (Launch Öncesi) - 4-6 Hafta
6. **EPIC 6:** Email System (2 gün)
7. **EPIC 7:** Monitoring ve DevOps (2-3 gün)
8. **EPIC 8:** Documentation (2 gün)

**Toplam Yüksek Öncelik:** 6-7 gün = ~**1-1.5 hafta**

---

## Orta Öncelik (Post-Launch İyileştirmeler) - 4-6 Hafta
9. **EPIC 9:** Code Quality ve CI/CD (1-2 gün)
10. **EPIC 10:** Performance Optimization (2 gün)
11. **EPIC 11:** Social Auth (1 gün)
12. **EPIC 12:** Backup Strategy (1 gün)

**Toplam Orta Öncelik:** 5-6 gün = ~**1 hafta**

---

## Düşük Öncelik (Nice-to-Have) - 5-8 Hafta
13. **EPIC 13:** Advanced Features (5-8 gün)

**Toplam Düşük Öncelik:** 5-8 gün = ~**1-1.5 hafta**

---

# GENEL TOPLAM
- **Minimum (sadece kritik):** ~4 hafta
- **Production-Ready (kritik + yüksek):** ~5.5-7 hafta
- **Polished (kritik + yüksek + orta):** ~7.5-8.5 hafta
- **Full Feature (tüm epic'ler):** ~8.5-10 hafta

---

# JIRA'YA GİRİŞ TAVSİYELERİ

## Epic Structure
Her EPIC'i Jira'da bir Epic olarak oluşturun:
- Epic Name: "EPIC 1: Test Altyapısı ve Kapsamı"
- Epic Link: NEWS-BACKEND-TEST-INFRA

## Story Structure
Her Story'yi bir User Story olarak oluşturun:
- Story Points: 1-5 arası (1 gün = 3 points)
- Sprint: Önceliğe göre sprint'lere dağıtın

## Sub-task Structure
Her Sub-task'i Story'nin altında Task olarak oluşturun:
- Assignee: Developer
- Time Estimate: 3-4 saat, 6-8 saat gibi
- Checklist: Sub-task içindeki bullet point'ler
- Acceptance Criteria: "Kabul Kriterleri" kısmı

## Label'lar
- `critical`, `high-priority`, `medium-priority`, `low-priority`
- `backend`, `frontend`, `devops`, `security`, `testing`
- `production-blocker`, `technical-debt`

## Component'ler
- Backend API
- Frontend Angular
- DevOps & Infra
- Security
- Documentation

---

**Not:** Bu backlog, projenin mevcut durumu baz alınarak hazırlanmıştır. Her task başlamadan önce teknik detaylar gözden geçirilmeli ve güncellenmelidir.
