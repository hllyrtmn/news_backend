import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // Home - Public
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Anasayfa'
  },

  // Auth Routes - Guest only
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
    title: 'Giriş Yap'
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
    title: 'Kayıt Ol'
  },
  {
    path: 'auth/2fa-setup',
    loadComponent: () => import('./pages/auth/two-factor-setup/two-factor-setup.component').then(m => m.TwoFactorSetupComponent),
    canActivate: [authGuard],
    title: 'İki Faktörlü Kimlik Doğrulama'
  },

  // Articles - Public
  {
    path: 'articles',
    loadComponent: () => import('./pages/articles/articles.component').then(m => m.ArticlesComponent),
    title: 'Haberler'
  },
  {
    path: 'articles/:slug',
    loadComponent: () => import('./pages/article-detail/article-detail.component').then(m => m.ArticleDetailComponent),
    title: 'Haber Detay'
  },

  // Category - Public
  {
    path: 'category/:slug',
    loadComponent: () => import('./pages/category/category.component').then(m => m.CategoryComponent),
    title: 'Kategori'
  },

  // Search - Public
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent),
    title: 'Arama'
  },

  // Profile - Auth required
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'Profil'
  },

  // Notifications - Auth required
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent),
    canActivate: [authGuard],
    title: 'Bildirimler'
  },

  // Bookmarks - Auth required
  {
    path: 'bookmarks',
    loadComponent: () => import('./pages/bookmarks/bookmarks.component').then(m => m.BookmarksComponent),
    canActivate: [authGuard],
    title: 'Kaydedilenler'
  },

  // Admin - Auth required
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard],
    title: 'Yönetim Paneli'
  },

  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
