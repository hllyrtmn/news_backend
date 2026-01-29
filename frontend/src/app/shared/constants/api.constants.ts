/**
 * API Endpoints Constants
 *
 * Centralized API endpoint definitions
 */

const API_VERSION = 'v1';
const API_BASE = `/api/${API_VERSION}`;

export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: `${API_BASE}/accounts/login/`,
    logout: `${API_BASE}/accounts/logout/`,
    register: `${API_BASE}/accounts/register/`,
    refresh: `${API_BASE}/accounts/token/refresh/`,
    me: `${API_BASE}/accounts/me/`,
    verify: `${API_BASE}/accounts/verify/`,
    resetPassword: `${API_BASE}/accounts/reset-password/`,
  },

  // Articles
  articles: {
    list: `${API_BASE}/articles/`,
    detail: (id: number) => `${API_BASE}/articles/${id}/`,
    create: `${API_BASE}/articles/`,
    update: (id: number) => `${API_BASE}/articles/${id}/`,
    delete: (id: number) => `${API_BASE}/articles/${id}/`,
    bulkPublish: `${API_BASE}/articles/bulk-publish/`,
    bulkDelete: `${API_BASE}/articles/bulk-delete/`,
  },

  // Categories
  categories: {
    list: `${API_BASE}/categories/`,
    detail: (id: number) => `${API_BASE}/categories/${id}/`,
    create: `${API_BASE}/categories/`,
    update: (id: number) => `${API_BASE}/categories/${id}/`,
    delete: (id: number) => `${API_BASE}/categories/${id}/`,
  },

  // Tags
  tags: {
    list: `${API_BASE}/tags/`,
    detail: (id: number) => `${API_BASE}/tags/${id}/`,
    create: `${API_BASE}/tags/`,
    update: (id: number) => `${API_BASE}/tags/${id}/`,
    delete: (id: number) => `${API_BASE}/tags/${id}/`,
  },

  // Users
  users: {
    list: `${API_BASE}/accounts/users/`,
    detail: (id: number) => `${API_BASE}/accounts/users/${id}/`,
    create: `${API_BASE}/accounts/users/`,
    update: (id: number) => `${API_BASE}/accounts/users/${id}/`,
    delete: (id: number) => `${API_BASE}/accounts/users/${id}/`,
    toggleActive: (id: number) => `${API_BASE}/accounts/users/${id}/toggle-active/`,
    activity: (id: number) => `${API_BASE}/accounts/users/${id}/activity/`,
  },

  // Comments
  comments: {
    list: `${API_BASE}/comments/`,
    detail: (id: number) => `${API_BASE}/comments/${id}/`,
    pending: `${API_BASE}/comments/pending/`,
    approve: (id: number) => `${API_BASE}/comments/${id}/approve/`,
    reject: (id: number) => `${API_BASE}/comments/${id}/reject/`,
    bulkModerate: `${API_BASE}/comments/bulk-moderate/`,
  },

  // Media
  media: {
    list: `${API_BASE}/media/`,
    detail: (id: number) => `${API_BASE}/media/${id}/`,
    upload: `${API_BASE}/media/upload/`,
    delete: (id: number) => `${API_BASE}/media/${id}/`,
  },

  // Analytics
  analytics: {
    dashboard: `${API_BASE}/analytics/admin-dashboard/`,
    traffic: `${API_BASE}/analytics/traffic/`,
    topArticles: `${API_BASE}/analytics/top-articles/`,
    engagement: `${API_BASE}/analytics/engagement/`,
    export: `${API_BASE}/analytics/export/`,
  },

  // Settings
  settings: {
    get: `${API_BASE}/settings/`,
    general: `${API_BASE}/settings/general/`,
    seo: `${API_BASE}/settings/seo/`,
    social: `${API_BASE}/settings/social/`,
  },

  // Notifications
  notifications: {
    list: `${API_BASE}/notifications/`,
    markRead: (id: number) => `${API_BASE}/notifications/${id}/mark-read/`,
    markAllRead: `${API_BASE}/notifications/mark-all-read/`,
  },
} as const;

export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export type ApiMethod = typeof API_METHODS[keyof typeof API_METHODS];
