/**
 * Application-wide Constants
 */

export const APP_CONFIG = {
  // Site info
  siteName: 'Haber Sitesi Admin',
  siteUrl: 'http://localhost:4200',

  // Pagination
  itemsPerPage: 20,
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],

  // File uploads
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxVideoSize: 50 * 1024 * 1024, // 50MB
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedImageExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  allowedVideoTypes: ['video/mp4', 'video/webm'],
  allowedDocTypes: ['application/pdf', 'application/msword'],

  // Content limits
  maxTitleLength: 200,
  maxExcerptLength: 500,
  maxContentLength: 50000,
  maxSlugLength: 200,
  minTitleLength: 3,
  minExcerptLength: 10,

  // Dates
  dateFormat: 'DD.MM.YYYY',
  dateTimeFormat: 'DD.MM.YYYY HH:mm',
  timeFormat: 'HH:mm',

  // Timeouts
  requestTimeout: 30000, // 30 seconds
  toastDuration: 3000, // 3 seconds
  errorToastDuration: 5000, // 5 seconds

  // Debounce delays
  searchDebounce: 300, // 300ms
  autoSaveDebounce: 1000, // 1 second

  // Local storage keys
  storageKeys: {
    token: 'auth_token',
    refreshToken: 'refresh_token',
    user: 'current_user',
    theme: 'theme',
    sidebarCollapsed: 'sidebar_collapsed',
    language: 'language',
  },

  // Feature flags
  features: {
    darkMode: true,
    notifications: true,
    analytics: true,
    export: true,
    bulkActions: true,
  },
} as const;

export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled',
  ARCHIVED: 'archived',
} as const;

export type ArticleStatus = typeof ARTICLE_STATUS[keyof typeof ARTICLE_STATUS];

export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  AUTHOR: 'author',
  USER: 'user',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const COMMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SPAM: 'spam',
} as const;

export type CommentStatus = typeof COMMENT_STATUS[keyof typeof COMMENT_STATUS];

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortOrder = typeof SORT_ORDERS[keyof typeof SORT_ORDERS];
