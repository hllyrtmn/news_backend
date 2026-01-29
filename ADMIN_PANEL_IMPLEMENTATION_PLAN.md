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
3. [Utils, Helpers & Mappers](#-utils-helpers--mappers)
4. [Özellik Grupları](#-özellik-grupları)
5. [Geliştirme Sırası](#-geliştirme-sırası)
6. [Component Patterns](#-component-patterns)
7. [State Management](#-state-management)
8. [Type Safety](#-type-safety)

---

## 🏗️ Mimari Prensipleri

### Core Principles

1. **Feature-Based Structure**: Her özellik kendi klasöründe, bağımsız
   - **Core**: Singleton services, interceptors (tüm uygulamada tek örnek)
   - **Shared**: Reusable UI components, pipes, directives
   - **Features**: Her iş mantığı kendi klasöründe (Dashboard, Articles, Users)

2. **Standalone Components (Angular 17+)**:
   - ❌ NgModule kullanma
   - ✅ Her component standalone
   - ✅ Sadece ihtiyacı olanı import et (bundle size optimizasyonu)

3. **Smart/Dumb Component Pattern**:
   - **Smart (Container)**: Service injection, state yönetimi, event handling
   - **Dumb (Presentational)**: Sadece `@Input()` / `@Output()`, saf UI rendering
   - ❌ Dumb component'te HTTP çağrısı YAPMA
   - ❌ Dumb component'te business logic YAPMA

4. **Signals + RxJS Hibrit Yaklaşım** ⭐ (Kritik!)
   - **Service içinde (private)**: RxJS ile asenkron işlemler
   - **Dışarıya (public)**: Signals ile state
   - ❌ Component'lere Observable sızdırma
   - ❌ Template'te `async` pipe kullanma
   - ✅ Service'te Observable → Signal dönüşümü

5. **Service Sorumluluğu**:
   - Business logic SADECE service katmanında
   - Feature-based services (AuthService, ArticleService, CategoryService)
   - ❌ Tek serviste tüm işlemler (God Service)

6. **Type Safety**: Strict TypeScript, interface/type tanımları

7. **Performance First**:
   - ✅ `ChangeDetectionStrategy.OnPush` (varsayılan)
   - ✅ `trackBy` fonksiyonları (*ngFor)
   - ✅ Lazy loading (route-based)

8. **Memory Leak Prevention**:
   - ❌ Manuel `.subscribe()` sonrası unutulan `unsubscribe`
   - ✅ `takeUntil()`, `take(1)`, `inject(DestroyRef)`
   - ✅ Signals (otomatik cleanup)

9. **Single Responsibility**: Her component/service tek bir işten sorumlu

10. **DRY**: Utils, Helpers, Mappers ile kod tekrarını önle

### Anti-Patterns to Avoid

#### ❌ Component Anti-Patterns

1. **HTTP İstekleri Component'te**
   ```typescript
   // ❌ YAPMA
   export class ArticleListComponent {
     ngOnInit() {
       this.http.get('/api/articles').subscribe(...);
     }
   }

   // ✅ YAP
   export class ArticleListComponent {
     constructor(private articleService: ArticleService) {}
     ngOnInit() {
       this.articleService.loadArticles();
     }
   }
   ```

2. **Complex Logic Component İçinde**
   ```typescript
   // ❌ YAPMA
   export class ArticleListComponent {
     filterAndSortArticles() {
       // 50 satır filtreleme ve sıralama logic
     }
   }

   // ✅ YAP - Utils kullan
   export class ArticleListComponent {
     filterAndSortArticles() {
       return ArrayUtils.sortBy(
         this.articles().filter(...),
         'createdAt',
         'desc'
       );
     }
   }
   ```

3. **Observable Sızdırma**
   ```typescript
   // ❌ YAPMA
   export class ArticleService {
     articles$ = this.http.get<Article[]>('/api/articles');
   }

   // Component'te
   articles$ = this.articleService.articles$;
   // Template: {{ articles$ | async }}

   // ✅ YAP - Signal kullan
   export class ArticleService {
     private _articles = signal<Article[]>([]);
     articles = this._articles.asReadonly();

     loadArticles() {
       this.http.get<Article[]>('/api/articles')
         .subscribe(data => this._articles.set(data));
     }
   }
   ```

4. **Default Change Detection**
   ```typescript
   // ❌ YAPMA
   @Component({
     selector: 'app-article-list',
     // changeDetection yok
   })

   // ✅ YAP
   @Component({
     selector: 'app-article-list',
     changeDetection: ChangeDetectionStrategy.OnPush
   })
   ```

5. **Memory Leaks**
   ```typescript
   // ❌ YAPMA
   export class Component {
     ngOnInit() {
       this.someService.data$.subscribe(...);
       // unsubscribe yok!
     }
   }

   // ✅ YAP
   export class Component {
     private destroy$ = inject(DestroyRef);

     ngOnInit() {
       this.someService.data$
         .pipe(takeUntilDestroyed(this.destroy$))
         .subscribe(...);
     }
   }
   ```

#### ❌ Service Anti-Patterns

1. **God Service**
   ```typescript
   // ❌ YAPMA - Tek serviste her şey
   export class AppService {
     login() {...}
     getArticles() {...}
     processPayment() {...}
   }

   // ✅ YAP - Feature-based
   export class AuthService { login() {...} }
   export class ArticleService { getArticles() {...} }
   export class PaymentService { processPayment() {...} }
   ```

2. **BehaviorSubject Abuse**
   ```typescript
   // ❌ YAPMA - Basit state için BehaviorSubject
   private articlesSubject = new BehaviorSubject<Article[]>([]);
   articles$ = this.articlesSubject.asObservable();

   // ✅ YAP - Signal kullan
   private _articles = signal<Article[]>([]);
   articles = this._articles.asReadonly();
   ```

3. **toSignal/toObservable Her Yerde**
   ```typescript
   // ❌ YAPMA
   articles = toSignal(this.http.get(...));

   // ✅ YAP - Service'te dönüşüm
   loadArticles() {
     this.http.get(...).subscribe(data => this._articles.set(data));
   }
   ```

#### ❌ Diğer Anti-Patterns

- **God Objects** - Tek component'te tüm logic
- **Code Duplication** - Aynı kodu farklı yerlerde tekrarlama
- **Magic Numbers/Strings** - Constants kullan
- **Any Types** - Strict typing kullan
- **SharedModule ile Bundle Bloat** - Standalone components kullan
- **Manuel Change Detection** - `ChangeDetectorRef.detectChanges()` çağırma

---

## 📁 Klasör Yapısı

> **Yapı:** Core (Singleton) → Shared (Reusable) → Features (Business Logic)

```
frontend/src/app/
├── core/                              # 🔒 CORE: Singleton services (app-wide)
│   ├── api/
│   │   ├── api.service.ts             # HTTP interceptor, base API
│   │   └── api.interceptor.ts         # Auth token, error handling
│   ├── auth/
│   │   ├── auth.service.ts            # Login/logout, token management
│   │   └── auth.guard.ts              # Route protection
│   └── state/
│       └── admin-state.service.ts     # Global admin state (signals)
│
├── shared/                            # 🔄 SHARED: Reusable components/utils
│   ├── ui/                            # Design system (standalone)
│   │   ├── button/
│   │   │   ├── button.component.ts    # Standalone, OnPush
│   │   │   └── button.component.html
│   │   ├── card/
│   │   ├── table/
│   │   ├── form-field/
│   │   ├── modal/
│   │   ├── toast/
│   │   ├── loading-spinner/
│   │   ├── empty-state/
│   │   └── confirmation-dialog/
│   │
│   ├── utils/                         # Pure functions
│   │   ├── date.utils.ts
│   │   ├── string.utils.ts
│   │   ├── array.utils.ts
│   │   ├── validation.utils.ts
│   │   ├── file.utils.ts
│   │   └── number.utils.ts
│   │
│   ├── helpers/                       # Stateful helpers
│   │   ├── form.helper.ts
│   │   ├── http.helper.ts
│   │   ├── storage.helper.ts
│   │   └── notification.helper.ts
│   │
│   ├── mappers/                       # Data transformation
│   │   ├── article.mapper.ts
│   │   ├── user.mapper.ts
│   │   ├── category.mapper.ts
│   │   └── analytics.mapper.ts
│   │
│   ├── constants/                     # App-wide constants
│   │   ├── api.constants.ts
│   │   ├── app.constants.ts
│   │   ├── routes.constants.ts
│   │   └── validation.constants.ts
│   │
│   ├── pipes/                         # Utility pipes (standalone)
│   │   ├── date-ago.pipe.ts
│   │   ├── truncate.pipe.ts
│   │   └── highlight.pipe.ts
│   │
│   └── directives/                    # Utility directives (standalone)
│       ├── tooltip.directive.ts
│       └── lazy-load.directive.ts
│
└── features/                          # ⚡ FEATURES: Business logic (isolated)
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
│   ├── utils/                         # Utility functions (pure)
│   │   ├── date.utils.ts              # formatDate, parseDate, dateRange
│   │   ├── string.utils.ts            # slugify, truncate, capitalize
│   │   ├── array.utils.ts             # groupBy, sortBy, unique
│   │   ├── validation.utils.ts        # isEmail, isUrl, isPhone
│   │   ├── file.utils.ts              # formatSize, getExtension, validateImage
│   │   └── number.utils.ts            # formatCurrency, percentage, abbreviate
│   │
│   ├── helpers/                       # Helper functions (stateful/side-effects)
│   │   ├── form.helper.ts             # buildFormData, validateForm
│   │   ├── http.helper.ts             # handleError, buildQueryParams
│   │   ├── storage.helper.ts          # localStorage wrapper (type-safe)
│   │   └── notification.helper.ts     # showSuccess, showError
│   │
│   ├── mappers/                       # Data transformation
│   │   ├── article.mapper.ts          # API ↔ Form data transformation
│   │   ├── user.mapper.ts
│   │   ├── category.mapper.ts
│   │   └── analytics.mapper.ts
│   │
│   ├── constants/                     # Shared constants
│   │   ├── api.constants.ts           # API endpoints
│   │   ├── app.constants.ts           # App-wide constants
│   │   ├── routes.constants.ts        # Route paths
│   │   └── validation.constants.ts    # Validation rules
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

## 🧩 Utils, Helpers & Mappers

> **Amaç:** Kod tekrarını önlemek, component'leri temiz tutmak, reusable logic

### 📐 Prensip: DRY (Don't Repeat Yourself)

**Kural:** Aynı logic 2. kez kullanılacaksa, extract et!

### 1. Utils (Pure Functions)

**Özellikler:**
- ✅ Side-effect yok
- ✅ Aynı input → aynı output
- ✅ Test edilmesi kolay
- ✅ Her yerde kullanılabilir

**Örnekler:**

```typescript
// shared/utils/date.utils.ts
export class DateUtils {
  static formatDate(date: Date | string, format: string = 'DD.MM.YYYY'): string {
    // Implementation
  }

  static dateAgo(date: Date | string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} saat önce`;
    return `${Math.floor(diffMins / 1440)} gün önce`;
  }

  static isToday(date: Date | string): boolean {
    const today = new Date();
    const check = new Date(date);
    return today.toDateString() === check.toDateString();
  }
}

// shared/utils/string.utils.ts
export class StringUtils {
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static truncate(text: string, length: number = 100): string {
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
  }

  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}

// shared/utils/array.utils.ts
export class ArrayUtils {
  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
      const group = String(item[key]);
      if (!result[group]) result[group] = [];
      result[group].push(item);
      return result;
    }, {} as Record<string, T[]>);
  }

  static sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  static unique<T>(array: T[]): T[] {
    return Array.from(new Set(array));
  }
}

// shared/utils/number.utils.ts
export class NumberUtils {
  static formatNumber(num: number): string {
    return new Intl.NumberFormat('tr-TR').format(num);
  }

  static abbreviate(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  static percentage(value: number, total: number): number {
    return total === 0 ? 0 : Math.round((value / total) * 100);
  }
}
```

### 2. Helpers (Stateful/Side-Effects)

**Özellikler:**
- ⚠️ Side-effects olabilir (API, localStorage, vb.)
- ✅ Reusable business logic
- ✅ Component'lerden extract edilmiş

**Örnekler:**

```typescript
// shared/helpers/http.helper.ts
export class HttpHelper {
  static buildQueryParams(filters: Record<string, any>): string {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    return params.toString();
  }

  static handleError(error: any): string {
    if (error.error?.detail) return error.error.detail;
    if (error.error?.message) return error.error.message;
    if (error.status === 404) return 'Kayıt bulunamadı';
    if (error.status === 403) return 'Bu işlem için yetkiniz yok';
    if (error.status === 500) return 'Sunucu hatası';
    return 'Bir hata oluştu';
  }
}

// shared/helpers/storage.helper.ts
export class StorageHelper {
  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Storage error:', e);
      return null;
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }
}

// shared/helpers/form.helper.ts
export class FormHelper {
  static buildFormData(data: Record<string, any>): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach(item => formData.append(key, item));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return formData;
  }

  static markFormGroupTouched(formGroup: any): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control?.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
```

### 3. Mappers (Data Transformation)

**Özellikler:**
- ✅ API response → Domain model
- ✅ Form data → API request
- ✅ Type-safe dönüşümler
- ✅ Null/undefined handling

**Örnekler:**

```typescript
// shared/mappers/article.mapper.ts
import { Article, ArticleFormData, ArticleApiResponse } from '../models/article.types';

export class ArticleMapper {
  // API response → Domain model
  static toDomain(apiData: ArticleApiResponse): Article {
    return {
      id: apiData.id,
      title: apiData.title,
      slug: apiData.slug,
      content: apiData.content,
      excerpt: apiData.excerpt || '',
      author: {
        id: apiData.author.id,
        name: apiData.author.full_name,
        avatar: apiData.author.profile_picture
      },
      category: apiData.category ? {
        id: apiData.category.id,
        name: apiData.category.name,
        slug: apiData.category.slug
      } : null,
      tags: apiData.tags.map(tag => ({
        id: tag.id,
        name: tag.name
      })),
      featuredImage: apiData.featured_image,
      status: apiData.status,
      viewsCount: apiData.views_count,
      createdAt: new Date(apiData.created_at),
      updatedAt: new Date(apiData.updated_at),
      publishedAt: apiData.published_at ? new Date(apiData.published_at) : null
    };
  }

  // Form data → API request
  static toApiRequest(formData: ArticleFormData): Record<string, any> {
    return {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt || '',
      category: formData.categoryId,
      tags: formData.tagIds,
      featured_image: formData.featuredImageId,
      status: formData.status,
      scheduled_at: formData.scheduledAt
    };
  }

  // Multiple API items → Domain models
  static toDomainList(apiList: ArticleApiResponse[]): Article[] {
    return apiList.map(item => this.toDomain(item));
  }
}

// shared/mappers/analytics.mapper.ts
export class AnalyticsMapper {
  static mapDashboardStats(apiData: any) {
    return {
      totalArticles: apiData.total_articles,
      totalUsers: apiData.total_users,
      totalViews: apiData.total_views,
      totalComments: apiData.total_comments,
      todayVsYesterday: {
        articles: this.calculateChange(
          apiData.today_stats.articles,
          apiData.yesterday_stats.articles
        ),
        views: this.calculateChange(
          apiData.today_stats.views,
          apiData.yesterday_stats.views
        )
      },
      trends: apiData.last_7_days.map((day: any) => ({
        date: new Date(day.date),
        views: day.views,
        articles: day.articles
      }))
    };
  }

  private static calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}
```

### 4. Constants

**Özellikler:**
- ✅ Magic strings/numbers yok
- ✅ Tek bir yerde tanımla
- ✅ Type-safe

**Örnekler:**

```typescript
// shared/constants/api.constants.ts
export const API_ENDPOINTS = {
  articles: '/api/v1/articles',
  categories: '/api/v1/categories',
  users: '/api/v1/accounts/users',
  comments: '/api/v1/comments',
  analytics: '/api/v1/analytics',
  media: '/api/v1/media'
} as const;

export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
} as const;

// shared/constants/app.constants.ts
export const APP_CONFIG = {
  itemsPerPage: 20,
  maxImageSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxTitleLength: 200,
  maxExcerptLength: 500
} as const;

export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled',
  ARCHIVED: 'archived'
} as const;

export type ArticleStatus = typeof ARTICLE_STATUS[keyof typeof ARTICLE_STATUS];

// shared/constants/routes.constants.ts
export const ADMIN_ROUTES = {
  dashboard: '/admin/dashboard',
  articles: {
    list: '/admin/articles',
    create: '/admin/articles/new',
    edit: (id: number) => `/admin/articles/${id}/edit`
  },
  users: {
    list: '/admin/users',
    detail: (id: number) => `/admin/users/${id}`
  }
} as const;
```

### 💡 Kullanım Örnekleri

#### ❌ KÖTÜ - Kod Tekrarı

```typescript
// article-list.component.ts
export class ArticleListComponent {
  formatDate(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    // ... aynı kod
  }
}

// comment-list.component.ts
export class CommentListComponent {
  formatDate(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    // ... AYNI KOD TEKRAR! ❌
  }
}
```

#### ✅ İYİ - Utils Kullan

```typescript
// article-list.component.ts
import { DateUtils } from '@shared/utils/date.utils';

export class ArticleListComponent {
  formatDate(date: string): string {
    return DateUtils.dateAgo(date);
  }
}

// comment-list.component.ts
import { DateUtils } from '@shared/utils/date.utils';

export class CommentListComponent {
  formatDate(date: string): string {
    return DateUtils.dateAgo(date);
  }
}
```

#### ✅ DAHA İYİ - Pipe Kullan

```typescript
// shared/pipes/date-ago.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DateUtils } from '@shared/utils/date.utils';

@Pipe({
  name: 'dateAgo',
  standalone: true
})
export class DateAgoPipe implements PipeTransform {
  transform(value: string | Date): string {
    return DateUtils.dateAgo(value);
  }
}

// Template'te kullan
{{ article.created_at | dateAgo }}
```

### 📋 Utils/Helpers Checklist

Yeni bir logic yazarken kendine sor:

- [ ] Bu logic başka yerde de kullanılabilir mi?
- [ ] Pure function olarak yazılabilir mi? (Utils)
- [ ] Side-effect var mı? (Helpers)
- [ ] API/Form data dönüşümü mü? (Mappers)
- [ ] Magic string/number var mı? (Constants)
- [ ] Component'i basitleştirir mi?

**Eğer EVET ise → Extract et!**

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

**Hedef:** Ortak componentler, layout, routing, utils/helpers

```
1. Utils, Helpers, Mappers oluştur (1 gün)
   - DateUtils, StringUtils, ArrayUtils, NumberUtils
   - HttpHelper, StorageHelper, FormHelper
   - Constants (API, App, Routes)
   - Base mappers (ArticleMapper, UserMapper)

2. Shared UI Components oluştur (1 gün)
   - Button, Card, Table, FormField
   - Modal, Toast, LoadingSpinner
   - EmptyState, ConfirmationDialog

3. Admin Layout oluştur (1 gün)
   - AdminLayoutComponent (sidebar + header + outlet)
   - SidebarComponent (navigasyon menü)
   - HeaderComponent (profil, logout, notif)

4. Routing yapılandırması (2 saat)
   - admin.routes.ts
   - Auth guard
   - Role-based access control

5. Core Services (1 gün)
   - ApiService (HTTP interceptor + HttpHelper kullanımı)
   - AdminStateService (global state - signals)
   - Type definitions

Toplam: ~4 gün
```

**Deliverables:**
- ✅ Utils/Helpers/Mappers library
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

- Phase 1 (Foundation + Utils): **4 gün**
- Phase 2 (Dashboard): **2 gün**
- Phase 3 (Articles): **4 gün**
- Phase 4 (Category/Media): **3 gün**
- Phase 5 (Users): **2.5 gün**
- Phase 6 (Comments): **1.5 gün**
- Phase 7 (Analytics): **2 gün**
- Phase 8 (Settings): **1 gün**

**TOPLAM: ~20 gün** (pure development time)

> Utils/Helpers'a 1 gün eklendi çünkü temiz kod için temel altyapı önemli!

---

## 🧩 Component Patterns

> **Temel Kural:** Component = UI + Event Handler, Service = Data + Business Logic

### ⭐ Signals + RxJS Hibrit Pattern (Zorunlu!)

**Kural:** Service içinde RxJS (mutfak), dışarıya Signals (vitrin)

#### Service Pattern (Doğru Yapı)

```typescript
// features/admin/content/articles/services/article.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, catchError } from 'rxjs/operators';
import { ArticleMapper } from '@shared/mappers/article.mapper';
import { HttpHelper } from '@shared/helpers/http.helper';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private http = inject(HttpClient);

  // 1️⃣ PRIVATE State (Internal - Writable)
  private _articles = signal<Article[]>([]);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);

  // 2️⃣ PUBLIC State (External - Readonly)
  articles = this._articles.asReadonly();
  isLoading = this._isLoading.asReadonly();
  error = this._error.asReadonly();

  // 3️⃣ Computed Signals
  articleCount = computed(() => this._articles().length);
  publishedArticles = computed(() =>
    this._articles().filter(a => a.status === 'published')
  );

  // 4️⃣ RxJS Logic (Private - Async Operations)
  loadArticles(filters: ArticleFilters) {
    this._isLoading.set(true);
    this._error.set(null);

    const params = HttpHelper.buildQueryParams(filters);

    this.http.get<ArticleApiResponse[]>(`/api/v1/articles?${params}`)
      .pipe(
        // RxJS operators burada
        finalize(() => this._isLoading.set(false)),
        catchError(error => {
          this._error.set(HttpHelper.handleError(error));
          return of([]);
        })
      )
      .subscribe(apiData => {
        // API response → Domain model (Mapper kullan)
        const articles = ArticleMapper.toDomainList(apiData);
        this._articles.set(articles);
      });
  }

  // Single article by ID
  loadArticle(id: number) {
    this._isLoading.set(true);

    return this.http.get<ArticleApiResponse>(`/api/v1/articles/${id}`)
      .pipe(
        finalize(() => this._isLoading.set(false))
      )
      .subscribe(apiData => {
        const article = ArticleMapper.toDomain(apiData);
        // Update state
        this._articles.update(articles => {
          const index = articles.findIndex(a => a.id === id);
          if (index >= 0) {
            articles[index] = article;
          }
          return [...articles];
        });
      });
  }

  // Create article
  createArticle(formData: ArticleFormData) {
    this._isLoading.set(true);

    const apiRequest = ArticleMapper.toApiRequest(formData);

    return this.http.post<ArticleApiResponse>('/api/v1/articles', apiRequest)
      .pipe(
        finalize(() => this._isLoading.set(false))
      )
      .subscribe(apiData => {
        const newArticle = ArticleMapper.toDomain(apiData);
        this._articles.update(articles => [newArticle, ...articles]);
      });
  }

  // Delete article
  deleteArticle(id: number) {
    return this.http.delete(`/api/v1/articles/${id}`)
      .subscribe(() => {
        this._articles.update(articles =>
          articles.filter(a => a.id !== id)
        );
      });
  }
}
```

**✅ Bu Pattern'in Avantajları:**
- Component'e Observable sızdırmıyor
- async pipe yok, template'te sadece signal
- RxJS sadece service içinde (encapsulation)
- Type-safe mapper kullanımı
- Centralized error handling
- Computed signals ile derived state

---

### Smart Component (Container) Example

```typescript
// features/admin/content/articles/article-list/article-list.component.ts
import { Component, signal, computed, inject, effect } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { ArticleService } from '../services/article.service';
import { ArticleFilters } from '../models/article.types';
import { ArticleTableComponent } from './components/article-table.component';
import { ArticleFiltersComponent } from './components/article-filters.component';
import { BulkActionsComponent } from './components/bulk-actions.component';

@Component({
  selector: 'app-article-list',
  standalone: true, // ✅ Standalone
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ Performance
  imports: [
    ArticleTableComponent,
    ArticleFiltersComponent,
    BulkActionsComponent
  ],
  template: `
    <div class="article-list-container">
      <!-- Filters -->
      <app-article-filters
        [filters]="filters()"
        (filtersChange)="onFiltersChange($event)"
      />

      <!-- Table -->
      <app-article-table
        [articles]="articleService.articles()"
        [loading]="articleService.isLoading()"
        [selectedIds]="selectedIds()"
        (selectionChange)="onSelectionChange($event)"
        (editArticle)="onEditArticle($event)"
        (deleteArticle)="onDeleteArticle($event)"
      />

      <!-- Bulk Actions -->
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
  // ✅ Service injection (modern way)
  articleService = inject(ArticleService);

  // ✅ Local UI state (not data!)
  selectedIds = signal<Set<number>>(new Set());
  filters = signal<ArticleFilters>({
    status: 'all',
    category: null,
    search: ''
  });

  // ✅ Computed signals
  selectedCount = computed(() => this.selectedIds().size);

  // ✅ Effect - filter değişince otomatik load
  constructor() {
    effect(() => {
      const currentFilters = this.filters();
      this.articleService.loadArticles(currentFilters);
    });
  }

  // ❌ Data fetching YOK! (Service'te)
  // ❌ Business logic YOK! (Service'te)
  // ✅ Sadece event handling

  onFiltersChange(filters: ArticleFilters) {
    this.filters.set(filters);
    // Effect otomatik tetiklenecek
  }

  onSelectionChange(ids: Set<number>) {
    this.selectedIds.set(ids);
  }

  onEditArticle(id: number) {
    // Navigate to editor
    this.router.navigate(['/admin/articles', id, 'edit']);
  }

  onDeleteArticle(id: number) {
    // ✅ Service method çağır
    this.articleService.deleteArticle(id);
  }

  onBulkPublish() {
    const ids = Array.from(this.selectedIds());
    this.articleService.bulkPublish(ids);
    this.selectedIds.set(new Set()); // Clear selection
  }
}
```

### Dumb Component (Presentational) Example

```typescript
// features/admin/content/articles/article-list/components/article-table.component.ts
import { Component, input, output, computed } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { Article } from '../../models/article.types';
import { DateAgoPipe } from '@shared/pipes/date-ago.pipe';
import { StatusBadgeComponent } from './status-badge.component';

@Component({
  selector: 'app-article-table',
  standalone: true, // ✅ Standalone
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ Performance
  imports: [DateAgoPipe, StatusBadgeComponent],
  template: `
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-3 text-left">
            <input
              type="checkbox"
              [checked]="allSelected()"
              (change)="toggleAll()"
            />
          </th>
          <th class="p-3 text-left">Başlık</th>
          <th class="p-3 text-left">Yazar</th>
          <th class="p-3 text-left">Durum</th>
          <th class="p-3 text-left">Tarih</th>
          <th class="p-3 text-left">İşlemler</th>
        </tr>
      </thead>
      <tbody>
        @if (loading()) {
          <tr>
            <td colspan="6" class="p-8 text-center text-gray-500">
              Yükleniyor...
            </td>
          </tr>
        } @else if (articles().length === 0) {
          <tr>
            <td colspan="6" class="p-8 text-center text-gray-500">
              Makale bulunamadı
            </td>
          </tr>
        } @else {
          @for (article of articles(); track article.id) {
            <tr class="border-b hover:bg-gray-50">
              <td class="p-3">
                <input
                  type="checkbox"
                  [checked]="selectedIds().has(article.id)"
                  (change)="toggleSelection(article.id)"
                />
              </td>
              <td class="p-3 font-medium">{{ article.title }}</td>
              <td class="p-3">{{ article.author.name }}</td>
              <td class="p-3">
                <app-status-badge [status]="article.status" />
              </td>
              <td class="p-3 text-sm text-gray-600">
                {{ article.createdAt | dateAgo }}
              </td>
              <td class="p-3 space-x-2">
                <button
                  class="text-blue-600 hover:underline"
                  (click)="editArticle.emit(article.id)"
                >
                  Düzenle
                </button>
                <button
                  class="text-red-600 hover:underline"
                  (click)="deleteArticle.emit(article.id)"
                >
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
  // ✅ Modern signal-based inputs (Angular 17+)
  articles = input.required<Article[]>();
  loading = input<boolean>(false);
  selectedIds = input.required<Set<number>>();

  // ✅ Outputs
  selectionChange = output<Set<number>>();
  editArticle = output<number>();
  deleteArticle = output<number>();

  // ✅ Computed (derived state)
  allSelected = computed(() => {
    const articles = this.articles();
    const selected = this.selectedIds();
    return articles.length > 0 && articles.every(a => selected.has(a.id));
  });

  // ❌ HTTP çağrısı YOK
  // ❌ Business logic YOK
  // ✅ Sadece UI logic

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
    const articles = this.articles();
    const selected = this.selectedIds();

    if (this.allSelected()) {
      // Deselect all
      this.selectionChange.emit(new Set());
    } else {
      // Select all
      const allIds = new Set(articles.map(a => a.id));
      this.selectionChange.emit(allIds);
    }
  }
}
```

---

### 🛡️ Memory Leak Prevention

**Problem:** RxJS subscribe() sonrası unsubscribe unutulması → Memory leak

#### ❌ YAPMA - Manuel Subscribe

```typescript
export class BadComponent {
  ngOnInit() {
    this.articleService.articles$.subscribe(articles => {
      // ...
    });
    // ❌ unsubscribe yok! Memory leak!
  }
}
```

#### ✅ YAP - Çözüm 1: Signals Kullan (En İyi)

```typescript
export class GoodComponent {
  articleService = inject(ArticleService);

  // ✅ Service'teki signal'i direkt kullan
  // Otomatik cleanup, memory leak yok!
  articles = this.articleService.articles;
}
```

#### ✅ YAP - Çözüm 2: takeUntilDestroyed

```typescript
import { Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class SearchComponent {
  private destroyRef = inject(DestroyRef);
  searchService = inject(SearchService);

  ngOnInit() {
    // Form value changes gibi durumlarda
    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef) // ✅ Otomatik unsubscribe
      )
      .subscribe(value => {
        this.searchService.search(value);
      });
  }
}
```

#### ✅ YAP - Çözüm 3: take(1)

```typescript
export class Component {
  loadOnce() {
    this.http.get('/api/data')
      .pipe(take(1)) // ✅ Tek seferlik, otomatik unsubscribe
      .subscribe(data => {
        this.data.set(data);
      });
  }
}
```

#### 📋 RxJS Kullanım Kuralları

**RxJS Kullan:**
- ✅ HTTP istekleri (HttpClient)
- ✅ Zamana bağlı işlemler (debounceTime, throttleTime, interval)
- ✅ Karmaşık akış birleştirmeleri (switchMap, forkJoin, combineLatest)
- ✅ Form value changes
- ✅ Event-based akışlar

**RxJS Kullanma:**
- ❌ Basit state tutma (Signal kullan)
- ❌ Component'e Observable sızdırma (Signal'e dönüştür)
- ❌ Template'te async pipe (Signal kullan)

---

### 📋 Best Practices Summary

#### Component Checklist

- [ ] `standalone: true`
- [ ] `changeDetection: ChangeDetectionStrategy.OnPush`
- [ ] Signal-based `input()` / `output()`
- [ ] Service'ten signal'leri tüket (Observable değil)
- [ ] HTTP çağrısı YOK
- [ ] Business logic YOK
- [ ] `*ngFor` ile `trackBy` kullan
- [ ] Memory leak yok (takeUntilDestroyed veya signal)

#### Service Checklist

- [ ] Feature-based (AuthService, ArticleService, etc.)
- [ ] Private writableSignal, public asReadonly()
- [ ] RxJS logic içeride (private)
- [ ] Signals dışarıda (public)
- [ ] Mapper kullan (API ↔ Domain)
- [ ] Helper kullan (HttpHelper, etc.)
- [ ] Type-safe (strict interfaces)
- [ ] Error handling (catchError, finalize)

#### General Checklist

- [ ] Utils kullan (kod tekrarı yok)
- [ ] Constants kullan (magic string/number yok)
- [ ] Computed signals (derived state)
- [ ] Effect kullan (side effects)
- [ ] Core/Shared/Features ayrımı
- [ ] Bundle size optimize (lazy loading)

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

### Frontend (Angular 17+)

#### Core
- **Framework:** Angular 17.3+ (Latest)
- **Architecture:** Standalone Components (no NgModule)
- **State Management:** Signals (native) + RxJS (hybrid)
- **Change Detection:** OnPush (default)
- **TypeScript:** Strict mode

#### UI & Styling
- **Styling:** TailwindCSS
- **Charts:** ApexCharts / Chart.js
- **Editor:** TinyMCE / Quill (WYSIWYG)
- **Icons:** Heroicons / Font Awesome

#### Forms & Validation
- **Forms:** Reactive Forms (signal-based)
- **Validation:** Custom validators + Utils

#### Data & HTTP
- **HTTP:** HttpClient + Interceptors
- **Pattern:** Service (RxJS) → Signal → Component
- **Mappers:** API ↔ Domain transformation
- **Error Handling:** HttpHelper

#### Performance
- **Lazy Loading:** Route-based code splitting
- **OnPush:** All components
- **TrackBy:** All *ngFor loops
- **Bundle Size:** Standalone components (tree-shaking)

#### Developer Experience
- **Code Organization:** Core / Shared / Features
- **Utils/Helpers:** Reusable logic
- **Type Safety:** Strict TypeScript, no `any`
- **Clean Code:** DRY, SOLID principles

### Backend (Existing)
- **Framework:** Django 5.x + Django REST Framework
- **Database:** PostgreSQL
- **Authentication:** JWT (djangorestframework-simplejwt)
- **API:** RESTful, versioned (/api/v1/)
- **Storage:** Local / S3 (media files)

---

## 📖 Referanslar ve Kaynaklar

Bu planın oluşturulmasında aşağıdaki kaynaklar referans alınmıştır:

### Angular Architecture & Patterns

**State Management**
- [Angular State Management with RxJS and Signals](https://medium.com/@bananicabananica/angular-state-management-with-rxjs-and-signals-and-rant-592dc8ddcef3)
  - Signals + RxJS hibrit pattern
  - Service katmanında state yönetimi
  - Best practices ve anti-patterns

**Feature-Based Design**
- [Angular Architecture That Clicks: Embracing Feature-Based Design](https://dev.to/sanket00123/angular-architecture-that-clicks-embracing-feature-based-design-4eje)
  - Feature-based klasör yapısı
  - Modüler mimari yaklaşımı
  - Scalable kod organizasyonu

**Component Patterns**
- [Smart vs Presentation Components: What's the Difference?](https://blog.angular-university.io/angular-2-smart-components-vs-presentation-components-whats-the-difference-when-to-use-each-and-why/)
  - Smart/Dumb component ayrımı
  - Container vs Presentational pattern
  - Best practices

### Angular Core Features

**Forms**
- [Angular Reactive Forms (v17)](https://v17.angular.io/guide/reactive-forms)
  - Signal-based reactive forms
  - Form validation
  - Dynamic forms

**Server-Side Rendering**
- [Angular SSR Guide (v17)](https://v17.angular.io/guide/ssr)
  - Server-side rendering setup
  - Performance optimization
  - SEO improvements

### Önerilen Ek Kaynaklar

**Angular Official Docs**
- [Angular Signals](https://angular.dev/guide/signals)
- [Standalone Components](https://angular.dev/guide/components/importing)
- [Change Detection](https://angular.dev/best-practices/runtime-performance)
- [Dependency Injection](https://angular.dev/guide/di)

**Best Practices**
- [Angular Coding Style Guide](https://angular.dev/style-guide)
- [Performance Best Practices](https://angular.dev/best-practices/runtime-performance)

**Community Resources**
- [Angular Blog](https://blog.angular.io/)
- [Angular University](https://blog.angular-university.io/)

---

## 🚦 Next Steps

1. **Review bu planı** - Feedback ver, eksik var mı?
2. **Phase 1'e başla** - Foundation oluştur
3. **Grup grup ilerle** - Her grup bittikçe test et
4. **Iterative development** - Her feature bittikçe demo yap

---

**Hazırız! 🚀 Hangi phase'den başlamak istersin?**
