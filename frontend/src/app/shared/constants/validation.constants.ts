/**
 * Validation Rules Constants
 */

export const VALIDATION_RULES = {
  // User
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false,
  },
  phone: {
    pattern: /^(\+90|0)?5\d{9}$/,
  },

  // Article
  title: {
    minLength: 3,
    maxLength: 200,
  },
  slug: {
    minLength: 3,
    maxLength: 200,
    pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },
  excerpt: {
    minLength: 10,
    maxLength: 500,
  },
  content: {
    minLength: 50,
    maxLength: 50000,
  },

  // Category
  categoryName: {
    minLength: 2,
    maxLength: 100,
  },
  categorySlug: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },

  // Tag
  tagName: {
    minLength: 2,
    maxLength: 50,
  },

  // Comment
  commentContent: {
    minLength: 3,
    maxLength: 1000,
  },

  // File
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  video: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedExtensions: ['mp4', 'webm', 'mov'],
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  },
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
} as const;

export const VALIDATION_MESSAGES = {
  required: 'Bu alan gereklidir',
  email: 'Geçerli bir e-posta adresi giriniz',
  minLength: (length: number) => `En az ${length} karakter olmalıdır`,
  maxLength: (length: number) => `En fazla ${length} karakter olabilir`,
  pattern: 'Geçersiz format',
  min: (value: number) => `En az ${value} olmalıdır`,
  max: (value: number) => `En fazla ${value} olabilir`,
  url: 'Geçerli bir URL giriniz',
  phone: 'Geçerli bir telefon numarası giriniz',
  mismatch: 'Değerler eşleşmiyor',
  fileSize: (maxSize: string) => `Dosya boyutu en fazla ${maxSize} olabilir`,
  fileType: (types: string[]) => `Sadece ${types.join(', ')} dosyaları kabul edilir`,
  unique: 'Bu değer zaten kullanılmakta',
  server: 'Sunucu hatası',
  network: 'Bağlantı hatası',
} as const;

// Password strength levels
export const PASSWORD_STRENGTH = {
  WEAK: { score: 0, label: 'Zayıf', color: '#dc3545' },
  FAIR: { score: 1, label: 'Orta', color: '#ffc107' },
  GOOD: { score: 2, label: 'İyi', color: '#17a2b8' },
  STRONG: { score: 3, label: 'Güçlü', color: '#28a745' },
  VERY_STRONG: { score: 4, label: 'Çok Güçlü', color: '#28a745' },
} as const;

// Form field types
export const FORM_FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  DATE: 'date',
  FILE: 'file',
} as const;

export type FormFieldType = typeof FORM_FIELD_TYPES[keyof typeof FORM_FIELD_TYPES];
