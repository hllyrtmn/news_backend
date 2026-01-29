# 🎯 Admin Panel Implementation Plan

> **Haber Sitesi Yönetim Paneli - Kapsamlı Geliştirme Planı**
>
> **Teknoloji:** Angular 17 (Signal-based, Standalone Components)
> **Mimari:** Feature-based, Smart/Dumb Component Pattern
> **İlham:** ensonhaber.com

---

## 📋 İçindekiler

1. [Mimari Prensipleri](#-mimari-prensipleri)
2. [Klasör Yapısı](#-klasör-yapısı)
3. [Özellik Grupları](#-özellik-grupları)
4. [Geliştirme Sırası](#-geliştirme-sırası)
5. [Component Patterns](#-component-patterns)
6. [State Management](#-state-management)
7. [Type Safety](#-type-safety)

---

## 🏗️ Mimari Prensipleri

### Core Principles

1. **Feature-Based Structure**: Her özellik kendi klasöründe, bağımsız modül
2. **Smart/Dumb Components**:
   - Smart (Container): API calls, state management, business logic
   - Dumb (Presentational): Sadece @Input/@Output, UI rendering
3. **Signal-Based Reactivity**: RxJS yerine Angular Signals (computed, effect)
4. **Type Safety**: Strict TypeScript, interface/type tanımları
5. **Single Responsibility**: Her component tek bir işten sorumlu
6. **Reusable UI**: Shared components, design system

### Anti-Patterns to Avoid

❌ God Objects (tek component'te tüm logic)
❌ Prop Drilling (signals ile çözülecek)
❌ Mixed Concerns (data fetching + UI aynı yerde)
❌ Any types (strict typing)

---

## 📁 Klasör Yapısı

```
frontend/src/app/
├── features/                          # Feature modules
│   └── admin/                         # Admin panel feature
│       ├── admin.routes.ts            # Admin routing
│       ├── layout/                    # Layout components
│       │   ├── admin-layout/          # Ana layout (sidebar + header)
│       │   ├── sidebar/               # Navigasyon sidebar
│       │   └── header/                # Üst header (profil, notif)
│       │
│       ├── dashboard/                 # 📊 GROUP 1: Dashboard
│       │   ├── dashboard.component.ts # Smart component
│       │   ├── components/            # Dumb components
│       │   │   ├── stats-card/
│       │   │   ├── trend-chart/
│       │   │   ├── activity-feed/
│       │   │   └── quick-actions/
│       │   ├── services/
│       │   │   └── dashboard.service.ts
│       │   └── models/
│       │       └── dashboard.types.ts
│       │
│       ├── content/                   # 📝 GROUP 2: Content Management
│       │   ├── articles/
│       │   │   ├── article-list/      # Smart: Liste + filters
│       │   │   │   ├── article-list.component.ts
│       │   │   │   └── components/
│       │   │   │       ├── article-table/        # Dumb: Tablo
│       │   │   │       ├── article-filters/      # Dumb: Filtreler
│       │   │   │       ├── bulk-actions/         # Dumb: Toplu işlem
│       │   │   │       └── status-badge/         # Dumb: Durum badge
│       │   │   │
│       │   │   ├── article-editor/    # Smart: Oluştur/Düzenle
│       │   │   │   ├── article-editor.component.ts
│       │   │   │   └── components/
│       │   │   │       ├── editor-form/          # Dumb: Form
│       │   │   │       ├── media-picker/         # Dumb: Resim seçici
│       │   │   │       ├── category-selector/    # Dumb: Kategori
│       │   │   │       ├── tag-input/            # Dumb: Tag input
│       │   │   │       ├── seo-panel/            # Dumb: SEO ayarları
│       │   │   │       └── preview-panel/        # Dumb: Önizleme
│       │   │   │
│       │   │   ├── services/
│       │   │   │   └── article.service.ts
│       │   │   └── models/
│       │   │       └── article.types.ts
│       │   │
│       │   ├── categories/
│       │   │   ├── category-list/
│       │   │   │   └── components/
│       │   │   │       ├── category-tree/        # Dumb: Ağaç yapısı
│       │   │   │       └── category-card/
│       │   │   ├── category-editor/
│       │   │   └── services/
│       │   │       └── category.service.ts
│       │   │
│       │   └── media/
│       │       ├── media-library/     # Smart: Medya kütüphanesi
│       │       │   └── components/
│       │       │       ├── media-grid/           # Dumb: Grid
│       │       │       ├── upload-zone/          # Dumb: Drag&drop
│       │       │       ├── image-editor/         # Dumb: Crop/resize
│       │       │       └── media-filters/
│       │       └── services/
│       │           └── media.service.ts
│       │
│       ├── users/                     # 👥 GROUP 3: User Management
│       │   ├── user-list/
│       │   │   ├── user-list.component.ts
│       │   │   └── components/
│       │   │       ├── user-table/
│       │   │       ├── user-filters/
│       │   │       ├── role-badge/
│       │   │       └── user-actions/
│       │   │
│       │   ├── user-editor/
│       │   │   └── components/
│       │   │       ├── user-form/
│       │   │       ├── role-selector/
│       │   │       ├── permission-matrix/        # Yetki tablosu
│       │   │       └── activity-log/
│       │   │
│       │   └── services/
│       │       └── user.service.ts
│       │
│       ├── moderation/                # 💬 GROUP 4: Comment & Moderation
│       │   ├── comments/
│       │   │   ├── comment-queue/     # Smart: Onay kuyruğu
│       │   │   │   └── components/
│       │   │   │       ├── comment-card/         # Dumb: Yorum kartı
│       │   │   │       ├── moderation-toolbar/   # Dumb: Onayla/Reddet
│       │   │   │       └── spam-indicator/
│       │   │   │
│       │   │   └── services/
│       │   │       └── comment-moderation.service.ts
│       │   │
│       │   └── reports/               # Şikayet yönetimi
│       │       ├── report-list/
│       │       └── services/
│       │           └── report.service.ts
│       │
│       ├── analytics/                 # 📈 GROUP 5: Analytics & Reports
│       │   ├── analytics-dashboard/
│       │   │   └── components/
│       │   │       ├── traffic-chart/
│       │   │       ├── top-articles/
│       │   │       ├── top-authors/
│       │   │       ├── engagement-metrics/
│       │   │       └── date-range-picker/
│       │   │
│       │   └── services/
│       │       └── analytics.service.ts
│       │
│       └── settings/                  # ⚙️ GROUP 6: Settings
│           ├── site-settings/
│           │   └── components/
│           │       ├── general-settings/
│           │       ├── seo-settings/
│           │       ├── social-settings/
│           │       └── notification-settings/
│           │
│           └── services/
│               └── settings.service.ts
│
├── shared/                            # Paylaşılan componentler
│   ├── ui/                            # Design system
│   │   ├── button/
│   │   ├── card/
│   │   ├── table/
│   │   ├── form-field/
│   │   ├── modal/
│   │   ├── toast/
│   │   ├── loading-spinner/
│   │   ├── empty-state/
│   │   └── confirmation-dialog/
│   │
│   ├── pipes/                         # Utility pipes
│   │   ├── date-ago.pipe.ts
│   │   ├── truncate.pipe.ts
│   │   └── highlight.pipe.ts
│   │
│   └── directives/
│       ├── tooltip.directive.ts
│       └── lazy-load.directive.ts
│
└── core/                              # Core services
    ├── api/
    │   └── api.service.ts             # HTTP interceptor
    ├── auth/
    │   └── auth.service.ts
    └── state/
        └── admin-state.service.ts     # Global admin state
```

---

## 🎯 Özellik Grupları

### GROUP 1: 📊 Dashboard & Analytics (Temel - İlk)

**Amaç:** Admin paneline giriş yapıldığında görülen ana sayfa

**Features:**
- ✅ Genel istatistikler (toplam makale, kullanıcı, görüntüleme)
- ✅ Bugün vs dün karşılaştırma
- ✅ 7 günlük trend grafikleri
- ✅ En popüler 10 makale
- ✅ En aktif 10 yazar
- ✅ Hızlı aksiyonlar (Yeni Makale, Yorum Onayla, vb.)
- ✅ Son aktiviteler feed

**Components:**
- `dashboard.component.ts` (Smart)
- `stats-card.component.ts` (Dumb)
- `trend-chart.component.ts` (Dumb)
- `activity-feed.component.ts` (Dumb)
- `quick-actions.component.ts` (Dumb)

**Backend Endpoint:**
```
GET /api/v1/analytics/admin-dashboard/
```

**Dependencies:** ✅ NONE (başlangıç noktası)

---

### GROUP 2: 📝 Content Management (Core)

**Amaç:** Makale, kategori, tag ve medya yönetimi

#### 2A: Article Management

**Features:**
- Makale listesi (filtreleme, arama, sayfalama)
- Makale oluştur/düzenle (WYSIWYG editor)
- Kategori ve tag atama
- SEO meta bilgileri
- Yayın durumu (Draft, Published, Scheduled)
- Kapak resmi yükleme/seçme
- Önizleme
- Toplu işlemler (silme, yayınlama, kategori değiştirme)

**Components:**
```
article-list.component.ts (Smart)
  └── components/
      ├── article-table.component.ts (Dumb)
      ├── article-filters.component.ts (Dumb)
      ├── bulk-actions.component.ts (Dumb)
      └── status-badge.component.ts (Dumb)

article-editor.component.ts (Smart)
  └── components/
      ├── editor-form.component.ts (Dumb)
      ├── media-picker.component.ts (Dumb)
      ├── category-selector.component.ts (Dumb)
      ├── tag-input.component.ts (Dumb)
      ├── seo-panel.component.ts (Dumb)
      └── preview-panel.component.ts (Dumb)
```

**Backend Endpoints:**
```
GET    /api/v1/articles/                # Liste
POST   /api/v1/articles/                # Oluştur
GET    /api/v1/articles/:id/            # Detay
PUT    /api/v1/articles/:id/            # Güncelle
DELETE /api/v1/articles/:id/            # Sil
PATCH  /api/v1/articles/bulk-publish/   # Toplu yayınla
```

#### 2B: Category Management

**Features:**
- Kategori listesi (hiyerarşik)
- Alt kategori desteği
- Kategori renk/ikon seçimi
- URL slug yönetimi

**Components:**
```
category-list.component.ts (Smart)
  └── components/
      ├── category-tree.component.ts (Dumb)
      └── category-card.component.ts (Dumb)

category-editor.component.ts (Smart)
  └── components/
      └── category-form.component.ts (Dumb)
```

**Backend Endpoints:**
```
GET    /api/v1/categories/
POST   /api/v1/categories/
PUT    /api/v1/categories/:id/
DELETE /api/v1/categories/:id/
```

#### 2C: Media Library

**Features:**
- Drag & drop yükleme
- Grid/List görünüm
- Filtreleme (tarih, tip, boyut)
- Resim düzenleme (crop, resize)
- Toplu silme
- Arama

**Components:**
```
media-library.component.ts (Smart)
  └── components/
      ├── media-grid.component.ts (Dumb)
      ├── upload-zone.component.ts (Dumb)
      ├── image-editor.component.ts (Dumb)
      └── media-filters.component.ts (Dumb)
```

**Backend Endpoints:**
```
GET    /api/v1/media/
POST   /api/v1/media/upload/
DELETE /api/v1/media/:id/
```

**Dependencies:**
- Dashboard (stats gösterimi için)

---

### GROUP 3: 👥 User Management

**Amaç:** Kullanıcı, yazar ve yetki yönetimi

**Features:**
- Kullanıcı listesi (filtreleme: rol, aktiflik)
- Kullanıcı oluştur/düzenle
- Rol yönetimi (Admin, Editor, Author, User)
- Yetki matrisi (permission matrix)
- Kullanıcı aktivite logu
- Kullanıcı engelleme/aktifleştirme
- Yazar profil yönetimi (bio, fotoğraf, sosyal medya)

**Components:**
```
user-list.component.ts (Smart)
  └── components/
      ├── user-table.component.ts (Dumb)
      ├── user-filters.component.ts (Dumb)
      ├── role-badge.component.ts (Dumb)
      └── user-actions.component.ts (Dumb)

user-editor.component.ts (Smart)
  └── components/
      ├── user-form.component.ts (Dumb)
      ├── role-selector.component.ts (Dumb)
      ├── permission-matrix.component.ts (Dumb)
      └── activity-log.component.ts (Dumb)
```

**Backend Endpoints:**
```
GET    /api/v1/accounts/users/
POST   /api/v1/accounts/users/
GET    /api/v1/accounts/users/:id/
PUT    /api/v1/accounts/users/:id/
PATCH  /api/v1/accounts/users/:id/toggle-active/
GET    /api/v1/accounts/users/:id/activity/
```

**Dependencies:**
- Dashboard (kullanıcı istatistikleri için)

---

### GROUP 4: 💬 Comment & Moderation

**Amaç:** Yorum moderasyonu ve şikayet yönetimi

**Features:**
- Yorum onay kuyruğu
- Toplu onaylama/reddetme
- Spam detection göstergesi
- Kullanıcı şikayetleri
- Yorum arama/filtreleme
- Otomatik moderasyon kuralları

**Components:**
```
comment-queue.component.ts (Smart)
  └── components/
      ├── comment-card.component.ts (Dumb)
      ├── moderation-toolbar.component.ts (Dumb)
      └── spam-indicator.component.ts (Dumb)

report-list.component.ts (Smart)
  └── components/
      └── report-card.component.ts (Dumb)
```

**Backend Endpoints:**
```
GET    /api/v1/comments/pending/
PATCH  /api/v1/comments/:id/approve/
PATCH  /api/v1/comments/:id/reject/
POST   /api/v1/comments/bulk-moderate/
GET    /api/v1/moderation/reports/
```

**Dependencies:**
- User Management (kullanıcı bilgileri için)
- Content Management (makale bilgileri için)

---

### GROUP 5: 📈 Analytics & Reports

**Amaç:** Detaylı istatistikler ve raporlar

**Features:**
- Trafik grafikleri (günlük, haftalık, aylık)
- En çok okunan makaleler (tarih aralığı)
- En aktif yazarlar
- Kategori performansı
- Engagement metrikleri (beğeni, yorum, paylaşım)
- Tarih aralığı seçici
- Export (PDF, Excel)

**Components:**
```
analytics-dashboard.component.ts (Smart)
  └── components/
      ├── traffic-chart.component.ts (Dumb)
      ├── top-articles.component.ts (Dumb)
      ├── top-authors.component.ts (Dumb)
      ├── engagement-metrics.component.ts (Dumb)
      └── date-range-picker.component.ts (Dumb)
```

**Backend Endpoints:**
```
GET /api/v1/analytics/traffic/?start_date=&end_date=
GET /api/v1/analytics/top-articles/?period=
GET /api/v1/analytics/engagement/
GET /api/v1/analytics/export/?format=pdf
```

**Dependencies:**
- Dashboard (benzer componentler)
- Content Management (makale verileri)

---

### GROUP 6: ⚙️ Settings & Configuration

**Amaç:** Site geneli ayarlar ve yapılandırma

**Features:**
- Genel ayarlar (site adı, logo, favicon)
- SEO ayarları (meta tags, sitemap)
- Sosyal medya entegrasyonu
- Bildirim ayarları
- Email şablonları
- Reklam yönetimi

**Components:**
```
site-settings.component.ts (Smart)
  └── components/
      ├── general-settings.component.ts (Dumb)
      ├── seo-settings.component.ts (Dumb)
      ├── social-settings.component.ts (Dumb)
      └── notification-settings.component.ts (Dumb)
```

**Backend Endpoints:**
```
GET  /api/v1/settings/
PUT  /api/v1/settings/general/
PUT  /api/v1/settings/seo/
```

**Dependencies:**
- NONE (bağımsız)

---

## 🚀 Geliştirme Sırası

### PHASE 1: Foundation (Temel Altyapı)

**Hedef:** Ortak componentler, layout, routing

```
1. Shared UI Components oluştur (1 gün)
   - Button, Card, Table, FormField
   - Modal, Toast, LoadingSpinner
   - EmptyState, ConfirmationDialog

2. Admin Layout oluştur (1 gün)
   - AdminLayoutComponent (sidebar + header + outlet)
   - SidebarComponent (navigasyon menü)
   - HeaderComponent (profil, logout, notif)

3. Routing yapılandırması (2 saat)
   - admin.routes.ts
   - Auth guard
   - Role-based access control

4. Core Services (1 gün)
   - ApiService (HTTP interceptor)
   - AdminStateService (global state - signals)
   - Type definitions

Toplam: ~3 gün
```

**Deliverables:**
- ✅ Shared UI library
- ✅ Admin layout shell
- ✅ Routing system
- ✅ Type-safe API service

---

### PHASE 2: GROUP 1 - Dashboard (İlk Görünür Özellik)

**Hedef:** Ana dashboard sayfası

```
1. Dashboard service + types (2 saat)
   - DashboardService (API calls)
   - Dashboard interfaces

2. Dashboard container (4 saat)
   - dashboard.component.ts (smart)
   - Signal-based state
   - API integration

3. Dashboard UI components (1 gün)
   - StatsCardComponent
   - TrendChartComponent (Chart.js/ApexCharts)
   - ActivityFeedComponent
   - QuickActionsComponent

Toplam: ~2 gün
```

**Deliverables:**
- ✅ Çalışan dashboard
- ✅ İstatistikler görünümü
- ✅ Chart entegrasyonu

---

### PHASE 3: GROUP 2A - Article Management (Core Feature)

**Hedef:** Makale CRUD işlemleri

```
1. Article service + models (4 saat)
   - ArticleService
   - Article types/interfaces

2. Article List (1 gün)
   - article-list.component.ts (smart)
   - ArticleTableComponent (dumb)
   - ArticleFiltersComponent (dumb)
   - BulkActionsComponent (dumb)
   - StatusBadgeComponent (dumb)

3. Article Editor (2 gün)
   - article-editor.component.ts (smart)
   - EditorFormComponent (WYSIWYG - TinyMCE/Quill)
   - MediaPickerComponent
   - CategorySelectorComponent
   - TagInputComponent
   - SeoPanelComponent
   - PreviewPanelComponent

Toplam: ~4 gün
```

**Deliverables:**
- ✅ Makale listeleme + filtreleme
- ✅ Makale oluşturma/düzenleme
- ✅ Medya seçimi
- ✅ SEO panel

---

### PHASE 4: GROUP 2B - Category & Media Management

**Hedef:** Kategori ve medya yönetimi

```
1. Category Management (1 gün)
   - CategoryListComponent
   - CategoryTreeComponent (hiyerarşik)
   - CategoryEditorComponent

2. Media Library (2 gün)
   - MediaLibraryComponent (smart)
   - MediaGridComponent (dumb)
   - UploadZoneComponent (drag&drop)
   - ImageEditorComponent (crop)
   - MediaFiltersComponent

Toplam: ~3 gün
```

**Deliverables:**
- ✅ Kategori yönetimi
- ✅ Medya kütüphanesi
- ✅ Resim yükleme + düzenleme

---

### PHASE 5: GROUP 3 - User Management

**Hedef:** Kullanıcı ve yetki yönetimi

```
1. User service + types (2 saat)

2. User List (1 gün)
   - UserListComponent (smart)
   - UserTableComponent (dumb)
   - UserFiltersComponent
   - RoleBadgeComponent
   - UserActionsComponent

3. User Editor (1 gün)
   - UserEditorComponent (smart)
   - UserFormComponent
   - RoleSelectorComponent
   - PermissionMatrixComponent
   - ActivityLogComponent

Toplam: ~2.5 gün
```

---

### PHASE 6: GROUP 4 - Comment Moderation

**Hedef:** Yorum moderasyonu

```
1. Comment moderation (1.5 gün)
   - CommentQueueComponent (smart)
   - CommentCardComponent (dumb)
   - ModerationToolbarComponent
   - SpamIndicatorComponent

Toplam: ~1.5 gün
```

---

### PHASE 7: GROUP 5 - Analytics

**Hedef:** Detaylı analitik

```
1. Analytics dashboard (2 gün)
   - AnalyticsDashboardComponent
   - TrafficChartComponent
   - TopArticlesComponent
   - TopAuthorsComponent
   - EngagementMetricsComponent
   - DateRangePickerComponent

Toplam: ~2 gün
```

---

### PHASE 8: GROUP 6 - Settings

**Hedef:** Site ayarları

```
1. Settings pages (1 gün)
   - SiteSettingsComponent
   - GeneralSettingsComponent
   - SeoSettingsComponent
   - SocialSettingsComponent

Toplam: ~1 gün
```

---

### 📊 Toplam Süre Tahmini

- Phase 1 (Foundation): **3 gün**
- Phase 2 (Dashboard): **2 gün**
- Phase 3 (Articles): **4 gün**
- Phase 4 (Category/Media): **3 gün**
- Phase 5 (Users): **2.5 gün**
- Phase 6 (Comments): **1.5 gün**
- Phase 7 (Analytics): **2 gün**
- Phase 8 (Settings): **1 gün**

**TOPLAM: ~19 gün** (pure development time)

---

## 🧩 Component Patterns

### Smart Component (Container) Example

```typescript
// article-list.component.ts
import { Component, signal, computed } from '@angular/core';
import { ArticleService } from './services/article.service';
import { Article, ArticleFilters } from './models/article.types';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [
    ArticleTableComponent,
    ArticleFiltersComponent,
    BulkActionsComponent
  ],
  template: `
    <div class="article-list-container">
      <app-article-filters
        [filters]="filters()"
        (filtersChange)="onFiltersChange($event)"
      />

      <app-article-table
        [articles]="articles()"
        [loading]="loading()"
        [selectedIds]="selectedIds()"
        (selectionChange)="onSelectionChange($event)"
        (editArticle)="onEditArticle($event)"
        (deleteArticle)="onDeleteArticle($event)"
      />

      <app-bulk-actions
        [selectedCount]="selectedCount()"
        [disabled]="selectedCount() === 0"
        (publishSelected)="onBulkPublish()"
        (deleteSelected)="onBulkDelete()"
      />
    </div>
  `
})
export class ArticleListComponent {
  // Signals
  articles = signal<Article[]>([]);
  loading = signal(false);
  selectedIds = signal<Set<number>>(new Set());
  filters = signal<ArticleFilters>({
    status: 'all',
    category: null,
    search: ''
  });

  // Computed signals
  selectedCount = computed(() => this.selectedIds().size);
  filteredArticles = computed(() => {
    const filters = this.filters();
    return this.articles().filter(article => {
      // Filter logic
      return true;
    });
  });

  constructor(private articleService: ArticleService) {
    this.loadArticles();
  }

  // Data fetching (business logic)
  async loadArticles() {
    this.loading.set(true);
    try {
      const data = await this.articleService.getArticles(this.filters());
      this.articles.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  // Event handlers
  onFiltersChange(filters: ArticleFilters) {
    this.filters.set(filters);
    this.loadArticles();
  }

  onSelectionChange(ids: Set<number>) {
    this.selectedIds.set(ids);
  }

  onEditArticle(id: number) {
    // Navigate to editor
  }

  onDeleteArticle(id: number) {
    // Delete logic
  }

  onBulkPublish() {
    // Bulk publish logic
  }
}
```

### Dumb Component (Presentational) Example

```typescript
// article-table.component.ts
import { Component, input, output } from '@angular/core';
import { Article } from '../models/article.types';

@Component({
  selector: 'app-article-table',
  standalone: true,
  template: `
    <table class="w-full">
      <thead>
        <tr>
          <th><input type="checkbox" (change)="toggleAll()" /></th>
          <th>Başlık</th>
          <th>Yazar</th>
          <th>Durum</th>
          <th>Tarih</th>
          <th>İşlemler</th>
        </tr>
      </thead>
      <tbody>
        @if (loading()) {
          <tr><td colspan="6">Yükleniyor...</td></tr>
        } @else {
          @for (article of articles(); track article.id) {
            <tr>
              <td>
                <input
                  type="checkbox"
                  [checked]="selectedIds().has(article.id)"
                  (change)="toggleSelection(article.id)"
                />
              </td>
              <td>{{ article.title }}</td>
              <td>{{ article.author }}</td>
              <td>
                <app-status-badge [status]="article.status" />
              </td>
              <td>{{ article.created_at | dateAgo }}</td>
              <td>
                <button (click)="editArticle.emit(article.id)">
                  Düzenle
                </button>
                <button (click)="deleteArticle.emit(article.id)">
                  Sil
                </button>
              </td>
            </tr>
          }
        }
      </tbody>
    </table>
  `
})
export class ArticleTableComponent {
  // Inputs (signal-based)
  articles = input.required<Article[]>();
  loading = input(false);
  selectedIds = input.required<Set<number>>();

  // Outputs
  selectionChange = output<Set<number>>();
  editArticle = output<number>();
  deleteArticle = output<number>();

  toggleSelection(id: number) {
    const newSet = new Set(this.selectedIds());
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    this.selectionChange.emit(newSet);
  }

  toggleAll() {
    // Toggle all logic
  }
}
```

---

## 🔄 State Management

### Global Admin State (Signals)

```typescript
// core/state/admin-state.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/user.types';

@Injectable({
  providedIn: 'root'
})
export class AdminStateService {
  // Global state
  currentUser = signal<User | null>(null);
  sidebarCollapsed = signal(false);
  notifications = signal<Notification[]>([]);

  // Computed
  unreadCount = computed(() =>
    this.notifications().filter(n => !n.read).length
  );

  // Actions
  toggleSidebar() {
    this.sidebarCollapsed.update(val => !val);
  }

  addNotification(notification: Notification) {
    this.notifications.update(list => [...list, notification]);
  }
}
```

### Local Component State (Signals)

```typescript
// Her component kendi local state'ini yönetir
export class ArticleEditorComponent {
  // Form state
  article = signal<ArticleFormData>({
    title: '',
    content: '',
    category: null
  });

  // UI state
  saving = signal(false);
  showPreview = signal(false);

  // Computed
  isValid = computed(() => {
    const data = this.article();
    return data.title.length > 0 && data.content.length > 0;
  });
}
```

---

## 🔒 Type Safety

### Type Definitions

```typescript
// models/article.types.ts
export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: Author;
  category: Category;
  tags: Tag[];
  featured_image: string | null;
  status: ArticleStatus;
  views_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export type ArticleStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface ArticleFormData {
  title: string;
  content: string;
  excerpt?: string;
  category_id: number | null;
  tag_ids: number[];
  featured_image_id: number | null;
  status: ArticleStatus;
  scheduled_at?: string;
}

export interface ArticleFilters {
  status: ArticleStatus | 'all';
  category: number | null;
  author: number | null;
  search: string;
  date_from?: string;
  date_to?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API Response types
export type ArticleListResponse = PaginatedResponse<Article>;
export type ArticleDetailResponse = Article;
```

### Service Type Safety

```typescript
// services/article.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  Article,
  ArticleFormData,
  ArticleListResponse,
  ArticleFilters
} from '../models/article.types';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/articles';

  async getArticles(filters: ArticleFilters): Promise<Article[]> {
    const params = this.buildParams(filters);
    const response = await firstValueFrom(
      this.http.get<ArticleListResponse>(`${this.baseUrl}/`, { params })
    );
    return response.results;
  }

  async getArticle(id: number): Promise<Article> {
    return firstValueFrom(
      this.http.get<Article>(`${this.baseUrl}/${id}/`)
    );
  }

  async createArticle(data: ArticleFormData): Promise<Article> {
    return firstValueFrom(
      this.http.post<Article>(`${this.baseUrl}/`, data)
    );
  }

  async updateArticle(id: number, data: Partial<ArticleFormData>): Promise<Article> {
    return firstValueFrom(
      this.http.put<Article>(`${this.baseUrl}/${id}/`, data)
    );
  }

  async deleteArticle(id: number): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${id}/`)
    );
  }

  private buildParams(filters: ArticleFilters): Record<string, string> {
    const params: Record<string, string> = {};

    if (filters.status !== 'all') {
      params['status'] = filters.status;
    }
    if (filters.category) {
      params['category'] = filters.category.toString();
    }
    if (filters.search) {
      params['search'] = filters.search;
    }

    return params;
  }
}
```

---

## 🎨 UI Design Guidelines

### Design System Principles

1. **Color Palette** (ensonhaber.com inspired)
   - Primary: `#D32F2F` (kırmızı - haber vurgusu)
   - Secondary: `#424242` (koyu gri)
   - Success: `#4CAF50`
   - Warning: `#FFC107`
   - Error: `#F44336`
   - Background: `#FAFAFA`

2. **Typography**
   - Headings: Roboto Bold
   - Body: Roboto Regular
   - Code: Roboto Mono

3. **Spacing**
   - Base unit: 4px
   - Padding: 8px, 16px, 24px, 32px
   - Margins: 8px, 16px, 24px

4. **Components**
   - Rounded corners: 4px
   - Shadows: subtle elevation
   - Buttons: medium height (40px)
   - Inputs: consistent height (40px)

### Responsive Design

- Desktop first (admin panel)
- Breakpoints:
  - Desktop: 1280px+
  - Tablet: 768px - 1279px
  - Mobile: < 768px (collapsible sidebar)

---

## ✅ Checklist

### Foundation
- [ ] Shared UI components (Button, Card, Table, etc.)
- [ ] Admin layout (sidebar + header)
- [ ] Routing configuration
- [ ] Auth guard
- [ ] API service with interceptor
- [ ] Global state service (signals)
- [ ] Type definitions

### GROUP 1: Dashboard
- [ ] Dashboard service
- [ ] Stats cards
- [ ] Trend charts
- [ ] Activity feed
- [ ] Quick actions

### GROUP 2: Content
- [ ] Article list + filters
- [ ] Article editor (WYSIWYG)
- [ ] Category management
- [ ] Media library
- [ ] Bulk operations

### GROUP 3: Users
- [ ] User list + filters
- [ ] User editor
- [ ] Role management
- [ ] Permission matrix

### GROUP 4: Moderation
- [ ] Comment queue
- [ ] Approval/rejection
- [ ] Spam detection

### GROUP 5: Analytics
- [ ] Traffic charts
- [ ] Top articles
- [ ] Engagement metrics

### GROUP 6: Settings
- [ ] General settings
- [ ] SEO settings
- [ ] Social media settings

---

## 📚 Technical Stack

### Frontend
- **Framework:** Angular 17.3
- **State:** Signals (native Angular)
- **Styling:** TailwindCSS
- **Charts:** ApexCharts / Chart.js
- **Editor:** TinyMCE / Quill
- **Forms:** Reactive Forms
- **HTTP:** HttpClient (async/await pattern)

### Backend (existing)
- Django + DRF
- PostgreSQL
- JWT Authentication

---

## 🚦 Next Steps

1. **Review bu planı** - Feedback ver, eksik var mı?
2. **Phase 1'e başla** - Foundation oluştur
3. **Grup grup ilerle** - Her grup bittikçe test et
4. **Iterative development** - Her feature bittikçe demo yap

---

**Hazırız! 🚀 Hangi phase'den başlamak istersin?**
