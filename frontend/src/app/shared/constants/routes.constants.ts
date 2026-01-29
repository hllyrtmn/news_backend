/**
 * Application Routes Constants
 */

export const PUBLIC_ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  articles: '/articles',
  articleDetail: (slug: string) => `/articles/${slug}`,
  category: (slug: string) => `/category/${slug}`,
  tag: (slug: string) => `/tag/${slug}`,
  search: '/search',
} as const;

export const ADMIN_ROUTES = {
  // Base
  admin: '/admin',

  // Dashboard
  dashboard: '/admin/dashboard',

  // Articles
  articles: {
    list: '/admin/articles',
    create: '/admin/articles/new',
    edit: (id: number) => `/admin/articles/${id}/edit`,
    detail: (id: number) => `/admin/articles/${id}`,
  },

  // Categories
  categories: {
    list: '/admin/categories',
    create: '/admin/categories/new',
    edit: (id: number) => `/admin/categories/${id}/edit`,
  },

  // Tags
  tags: {
    list: '/admin/tags',
    create: '/admin/tags/new',
    edit: (id: number) => `/admin/tags/${id}/edit`,
  },

  // Media
  media: {
    library: '/admin/media',
    upload: '/admin/media/upload',
  },

  // Users
  users: {
    list: '/admin/users',
    create: '/admin/users/new',
    edit: (id: number) => `/admin/users/${id}/edit`,
    detail: (id: number) => `/admin/users/${id}`,
  },

  // Comments
  comments: {
    list: '/admin/comments',
    pending: '/admin/comments/pending',
    detail: (id: number) => `/admin/comments/${id}`,
  },

  // Analytics
  analytics: {
    dashboard: '/admin/analytics',
    traffic: '/admin/analytics/traffic',
    engagement: '/admin/analytics/engagement',
  },

  // Settings
  settings: {
    general: '/admin/settings/general',
    seo: '/admin/settings/seo',
    social: '/admin/settings/social',
    notifications: '/admin/settings/notifications',
  },

  // Profile
  profile: '/admin/profile',
  notifications: '/admin/notifications',
} as const;

export const AUTH_ROUTES = {
  login: '/login',
  logout: '/logout',
  register: '/register',
} as const;

// Route guards
export const ADMIN_REQUIRED_ROLES = ['admin', 'editor', 'author'] as const;
export const EDITOR_REQUIRED_ROLES = ['admin', 'editor'] as const;
export const ADMIN_ONLY_ROLES = ['admin'] as const;
