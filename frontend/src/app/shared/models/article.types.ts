/**
 * Article Type Definitions
 */

import { ArticleStatus } from '../constants/app.constants';

// Author info
export interface Author {
  id: number;
  name: string;
  avatar: string | null;
  bio?: string;
}

// Category info
export interface Category {
  id: number;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
}

// Tag info
export interface Tag {
  id: number;
  name: string;
  slug: string;
}

// Domain Model (Frontend)
export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: Author;
  category: Category | null;
  tags: Tag[];
  featuredImage: string | null;
  status: ArticleStatus;
  viewsCount: number;
  likesCount?: number;
  commentsCount?: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  scheduledAt?: Date | null;
}

// API Response Model (Backend → Frontend)
export interface ArticleApiResponse {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: {
    id: number;
    full_name: string;
    profile_picture: string | null;
    bio?: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    color?: string;
    icon?: string;
  } | null;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  featured_image: string | null;
  status: ArticleStatus;
  views_count: number;
  likes_count?: number;
  comments_count?: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  scheduled_at?: string | null;
}

// Form Data Model (Frontend → Backend)
export interface ArticleFormData {
  title: string;
  content: string;
  excerpt?: string;
  categoryId: number | null;
  tagIds: number[];
  featuredImageId: number | null;
  status: ArticleStatus;
  scheduledAt?: string | null;
}

// Filters
export interface ArticleFilters {
  status?: ArticleStatus | 'all';
  category?: number | null;
  author?: number | null;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  orderBy?: 'created_at' | 'updated_at' | 'views_count' | 'title';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Paginated Response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ArticleListResponse = PaginatedResponse<ArticleApiResponse>;
