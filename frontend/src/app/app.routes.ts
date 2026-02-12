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

  // Admin - Auth required with role-based access
  {
    path: 'admin',
    loadComponent: () =>
      import('./shared/layout/main-layout/main-layout.component').then(
        m => m.MainLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      // Dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard',
      },

      // Articles
      {
        path: 'articles',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/articles/article-list/article-list.component').then(
                m => m.ArticleListComponent
              ),
            title: 'Makaleler',
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/articles/article-form/article-form.component').then(
                m => m.ArticleFormComponent
              ),
            title: 'Yeni Makale',
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/articles/article-form/article-form.component').then(
                m => m.ArticleFormComponent
              ),
            title: 'Makale Düzenle',
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/articles/article-detail/article-detail.component').then(
                m => m.ArticleDetailComponent
              ),
            title: 'Makale Detay',
          },
        ],
      },

      // Categories
      {
        path: 'categories',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/categories/category-list/category-list.component').then(
                m => m.CategoryListComponent
              ),
            title: 'Kategoriler',
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/categories/category-form/category-form.component').then(
                m => m.CategoryFormComponent
              ),
            title: 'Yeni Kategori',
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/categories/category-form/category-form.component').then(
                m => m.CategoryFormComponent
              ),
            title: 'Kategori Düzenle',
          },
        ],
      },

      // Tags
      {
        path: 'tags',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/tags/tag-list/tag-list.component').then(
                m => m.TagListComponent
              ),
            title: 'Etiketler',
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/tags/tag-form/tag-form.component').then(
                m => m.TagFormComponent
              ),
            title: 'Yeni Etiket',
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/tags/tag-form/tag-form.component').then(
                m => m.TagFormComponent
              ),
            title: 'Etiket Düzenle',
          },
        ],
      },

      // Media
      {
        path: 'media',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/media/media-library/media-library.component').then(
                m => m.MediaLibraryComponent
              ),
            title: 'Medya Kütüphanesi',
          },
          {
            path: 'upload',
            loadComponent: () =>
              import('./features/media/media-upload/media-upload.component').then(
                m => m.MediaUploadComponent
              ),
            title: 'Medya Yükle',
          },
        ],
      },

      // Users
      {
        path: 'users',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/users/user-list/user-list.component').then(
                m => m.UserListComponent
              ),
            title: 'Kullanıcılar',
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/users/user-form/user-form.component').then(
                m => m.UserFormComponent
              ),
            title: 'Yeni Kullanıcı',
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/users/user-form/user-form.component').then(
                m => m.UserFormComponent
              ),
            title: 'Kullanıcı Düzenle',
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/users/user-detail/user-detail.component').then(
                m => m.UserDetailComponent
              ),
            title: 'Kullanıcı Detay',
          },
        ],
      },

      // Comments
      {
        path: 'comments',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/comments/comment-list/comment-list.component').then(
                m => m.CommentListComponent
              ),
            title: 'Yorumlar',
          },
          {
            path: 'pending',
            loadComponent: () =>
              import('./features/comments/comment-list/comment-list.component').then(
                m => m.CommentListComponent
              ),
            title: 'Bekleyen Yorumlar',
          },
        ],
      },


    ],
  },

  // 404 Not Found
  {
    path: '**',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Sayfa Bulunamadı',
  }
];
