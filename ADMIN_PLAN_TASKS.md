# 📋 Admin Panel Implementation Tasks

> **Proje:** Haber Sitesi Admin Panel
> **Başlangıç:** 2026-01-29
> **Durum:** In Progress

---

## 🎯 Genel İlerleme

- [ ] **PHASE 1:** Foundation (Temel Altyapı) - 0/5
- [ ] **PHASE 2:** Dashboard - 0/3
- [ ] **PHASE 3:** Article Management - 0/3
- [ ] **PHASE 4:** Category & Media Management - 0/2
- [ ] **PHASE 5:** User Management - 0/2
- [ ] **PHASE 6:** Comment Moderation - 0/1
- [ ] **PHASE 7:** Analytics - 0/1
- [ ] **PHASE 8:** Settings - 0/1

**Toplam İlerleme:** 0/18 ana task

---

## 📅 PHASE 1: Foundation (Temel Altyapı)

**Hedef:** Ortak componentler, layout, routing, utils/helpers
**Süre:** ~4 gün

### 1.1 Utils, Helpers, Mappers oluştur

- [ ] **Utils (Pure Functions)**
  - [ ] `shared/utils/date.utils.ts` - formatDate, dateAgo, isToday
  - [ ] `shared/utils/string.utils.ts` - slugify, truncate, capitalize
  - [ ] `shared/utils/array.utils.ts` - groupBy, sortBy, unique
  - [ ] `shared/utils/number.utils.ts` - formatNumber, abbreviate, percentage
  - [ ] `shared/utils/validation.utils.ts` - isEmail, isUrl, isPhone
  - [ ] `shared/utils/file.utils.ts` - formatSize, getExtension, validateImage

- [ ] **Helpers (Stateful)**
  - [ ] `shared/helpers/http.helper.ts` - buildQueryParams, handleError
  - [ ] `shared/helpers/storage.helper.ts` - localStorage wrapper (type-safe)
  - [ ] `shared/helpers/form.helper.ts` - buildFormData, markFormGroupTouched
  - [ ] `shared/helpers/notification.helper.ts` - showSuccess, showError

- [ ] **Mappers**
  - [ ] `shared/mappers/article.mapper.ts` - API ↔ Domain transformation
  - [ ] `shared/mappers/user.mapper.ts`
  - [ ] `shared/mappers/category.mapper.ts`
  - [ ] `shared/mappers/analytics.mapper.ts`

- [ ] **Constants**
  - [ ] `shared/constants/api.constants.ts` - API endpoints
  - [ ] `shared/constants/app.constants.ts` - App-wide constants
  - [ ] `shared/constants/routes.constants.ts` - Route paths
  - [ ] `shared/constants/validation.constants.ts` - Validation rules

**Notlar:**
- Her util/helper class export olmalı
- Type-safe olmalı
- Pure functions side-effect yok

---

### 1.2 Shared UI Components oluştur

- [ ] **Button Component**
  - [ ] `shared/ui/button/button.component.ts` - Standalone, OnPush
  - [ ] Variants: primary, secondary, danger, ghost
  - [ ] Sizes: sm, md, lg
  - [ ] Loading state

- [ ] **Card Component**
  - [ ] `shared/ui/card/card.component.ts`
  - [ ] Header, body, footer slots
  - [ ] Shadow variants

- [ ] **Table Component**
  - [ ] `shared/ui/table/table.component.ts`
  - [ ] Sortable columns
  - [ ] Selection support
  - [ ] Empty state

- [ ] **Form Components**
  - [ ] `shared/ui/form-field/form-field.component.ts`
  - [ ] Input wrapper with label, error messages
  - [ ] Validation display

- [ ] **Modal Component**
  - [ ] `shared/ui/modal/modal.component.ts`
  - [ ] Overlay, close button
  - [ ] Size options

- [ ] **Toast Component**
  - [ ] `shared/ui/toast/toast.component.ts`
  - [ ] Success, error, warning, info types
  - [ ] Auto-dismiss

- [ ] **Loading Spinner**
  - [ ] `shared/ui/loading-spinner/loading-spinner.component.ts`
  - [ ] Size variants

- [ ] **Empty State**
  - [ ] `shared/ui/empty-state/empty-state.component.ts`
  - [ ] Icon, title, description, action button

- [ ] **Confirmation Dialog**
  - [ ] `shared/ui/confirmation-dialog/confirmation-dialog.component.ts`
  - [ ] Yes/No confirmation

**Notlar:**
- Tüm componentler standalone
- ChangeDetectionStrategy.OnPush
- TailwindCSS ile stil

---

### 1.3 Pipes & Directives

- [ ] **Pipes**
  - [ ] `shared/pipes/date-ago.pipe.ts` - DateUtils.dateAgo wrapper
  - [ ] `shared/pipes/truncate.pipe.ts` - StringUtils.truncate wrapper
  - [ ] `shared/pipes/highlight.pipe.ts` - Text highlighting

- [ ] **Directives**
  - [ ] `shared/directives/tooltip.directive.ts` - Tooltip gösterimi
  - [ ] `shared/directives/lazy-load.directive.ts` - Lazy load images

**Notlar:**
- Standalone pipes/directives
- Utils kullanmalı (DRY)

---

### 1.4 Admin Layout oluştur

- [ ] **Admin Layout Component**
  - [ ] `features/admin/layout/admin-layout/admin-layout.component.ts`
  - [ ] Sidebar + Header + RouterOutlet
  - [ ] Responsive (mobile: collapsible sidebar)

- [ ] **Sidebar Component**
  - [ ] `features/admin/layout/sidebar/sidebar.component.ts`
  - [ ] Navigasyon menüsü
  - [ ] Aktif route highlight
  - [ ] Collapse/expand
  - [ ] Menu items: Dashboard, Articles, Categories, Media, Users, Comments, Analytics, Settings

- [ ] **Header Component**
  - [ ] `features/admin/layout/header/header.component.ts`
  - [ ] Logo/site name
  - [ ] User profile dropdown
  - [ ] Notifications badge
  - [ ] Logout button

**Notlar:**
- Layout signals ile sidebar state yönetimi
- Mobile-first responsive

---

### 1.5 Routing yapılandırması

- [ ] **Admin Routes**
  - [ ] `features/admin/admin.routes.ts`
  - [ ] Lazy loading setup
  - [ ] Route guards

- [ ] **Auth Guard**
  - [ ] `core/auth/auth.guard.ts`
  - [ ] Token validation
  - [ ] Redirect to login if not authenticated

- [ ] **Role-based Access Control**
  - [ ] Admin role check
  - [ ] Editor role check
  - [ ] Author role check

**Notlar:**
- Route guards functional (inject pattern)
- Constants kullan (ADMIN_ROUTES)

---

### 1.6 Core Services

- [ ] **API Service**
  - [ ] `core/api/api.service.ts` - Base HTTP service
  - [ ] HttpHelper kullanımı
  - [ ] Error handling

- [ ] **API Interceptor**
  - [ ] `core/api/api.interceptor.ts`
  - [ ] Auth token ekleme
  - [ ] Error handling
  - [ ] Loading state

- [ ] **Auth Service**
  - [ ] `core/auth/auth.service.ts`
  - [ ] Login/logout
  - [ ] Token management (signals)
  - [ ] Current user state
  - [ ] StorageHelper kullanımı

- [ ] **Admin State Service**
  - [ ] `core/state/admin-state.service.ts`
  - [ ] Global admin state (signals)
  - [ ] Sidebar collapsed state
  - [ ] Notifications state

- [ ] **Type Definitions**
  - [ ] `core/models/user.types.ts`
  - [ ] `core/models/api.types.ts`
  - [ ] Interface/type exports

**Notlar:**
- Signals + RxJS hibrit pattern
- Private writable, public readonly
- Type-safe

---

## 🎯 PHASE 2: Dashboard (İlk Görünür Özellik)

**Hedef:** Ana dashboard sayfası
**Süre:** ~2 gün

### 2.1 Dashboard Service + Types

- [ ] `features/admin/dashboard/services/dashboard.service.ts`
- [ ] `features/admin/dashboard/models/dashboard.types.ts`
- [ ] API: GET `/api/v1/analytics/admin-dashboard/`
- [ ] AnalyticsMapper kullanımı

### 2.2 Dashboard Container Component

- [ ] `features/admin/dashboard/dashboard.component.ts` (Smart)
- [ ] Signal-based state
- [ ] Effect ile auto-load

### 2.3 Dashboard UI Components (Dumb)

- [ ] `dashboard/components/stats-card/stats-card.component.ts`
- [ ] `dashboard/components/trend-chart/trend-chart.component.ts` (ApexCharts)
- [ ] `dashboard/components/activity-feed/activity-feed.component.ts`
- [ ] `dashboard/components/quick-actions/quick-actions.component.ts`

---

## 🎯 PHASE 3: Article Management

**Hedef:** Makale CRUD işlemleri
**Süre:** ~4 gün

### 3.1 Article Service + Models

- [ ] ArticleService (Signals + RxJS)
- [ ] Article types/interfaces

### 3.2 Article List

- [ ] article-list.component.ts (Smart)
- [ ] ArticleTableComponent (Dumb)
- [ ] ArticleFiltersComponent (Dumb)
- [ ] BulkActionsComponent (Dumb)
- [ ] StatusBadgeComponent (Dumb)

### 3.3 Article Editor

- [ ] article-editor.component.ts (Smart)
- [ ] EditorFormComponent (TinyMCE/Quill)
- [ ] MediaPickerComponent
- [ ] CategorySelectorComponent
- [ ] TagInputComponent
- [ ] SeoPanelComponent
- [ ] PreviewPanelComponent

---

## 🎯 PHASE 4: Category & Media

**Süre:** ~3 gün

### 4.1 Category Management

- [ ] CategoryListComponent
- [ ] CategoryTreeComponent (hiyerarşik)
- [ ] CategoryEditorComponent

### 4.2 Media Library

- [ ] MediaLibraryComponent (Smart)
- [ ] MediaGridComponent (Dumb)
- [ ] UploadZoneComponent (drag&drop)
- [ ] ImageEditorComponent (crop)

---

## 🎯 PHASE 5: User Management

**Süre:** ~2.5 gün

### 5.1 User List

- [ ] UserListComponent (Smart)
- [ ] UserTableComponent (Dumb)
- [ ] UserFiltersComponent

### 5.2 User Editor

- [ ] UserEditorComponent (Smart)
- [ ] UserFormComponent
- [ ] RoleSelectorComponent
- [ ] PermissionMatrixComponent

---

## 🎯 PHASE 6: Comment Moderation

**Süre:** ~1.5 gün

### 6.1 Comment Queue

- [ ] CommentQueueComponent (Smart)
- [ ] CommentCardComponent (Dumb)
- [ ] ModerationToolbarComponent

---

## 🎯 PHASE 7: Analytics

**Süre:** ~2 gün

### 7.1 Analytics Dashboard

- [ ] AnalyticsDashboardComponent
- [ ] TrafficChartComponent
- [ ] TopArticlesComponent
- [ ] EngagementMetricsComponent

---

## 🎯 PHASE 8: Settings

**Süre:** ~1 gün

### 8.1 Settings Pages

- [ ] SiteSettingsComponent
- [ ] GeneralSettingsComponent
- [ ] SeoSettingsComponent

---

## 📝 Notlar & Öğrenilenler

### Günlük Notlar

**2026-01-29:**
- Admin plan oluşturuldu
- Task tracking sistemi kuruldu
- Phase 1'e başlanacak

### Karşılaşılan Sorunlar

_(Boş - sorunlar kaydedilecek)_

### İyileştirmeler

_(Boş - iyileştirme notları kaydedilecek)_

---

## 🔗 Referanslar

- [ADMIN_PANEL_IMPLEMENTATION_PLAN.md](./ADMIN_PANEL_IMPLEMENTATION_PLAN.md) - Ana plan dosyası
- Backend API: `http://localhost/api/v1/`
- Frontend: `frontend/src/app/`

---

**Son Güncelleme:** 2026-01-29
**Güncel Phase:** Phase 1 - Foundation
**Güncel Task:** 1.1 Utils, Helpers, Mappers
