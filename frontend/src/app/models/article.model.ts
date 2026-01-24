// Article models

import { AuthorProfile } from './user.model';
import { Category } from './category.model';
import { Tag } from './tag.model';

export type ArticleStatus = 'draft' | 'pending' | 'published' | 'archived';
export type ArticleVisibility = 'public' | 'premium' | 'subscriber_only';
export type ArticleType = 'news' | 'column' | 'analysis' | 'interview' | 'report' | 'opinion';

export interface Article {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  summary: string;
  content: string;
  author: AuthorProfile;
  co_authors: AuthorProfile[];
  category: Category;
  tags: Tag[];
  featured_image?: string;
  gallery: string[];

  // Video support
  has_video: boolean;
  video_url?: string;
  video_file?: string;
  video_thumbnail?: string;
  video_duration: number;
  video_embed_code?: string;

  status: ArticleStatus;
  visibility: ArticleVisibility;
  article_type: ArticleType;

  is_featured: boolean;
  is_breaking: boolean;
  is_trending: boolean;

  views_count: number;
  read_time: number;
  comment_count: number;

  published_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;

  // SEO
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image?: string;
}

export interface ArticleListItem {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  summary: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  author: {
    id: number;
    display_name: string;
    slug: string;
  };
  tags: {
    id: number;
    name: string;
    slug: string;
  }[];
  featured_image?: string;
  status: ArticleStatus;
  visibility: ArticleVisibility;
  article_type: ArticleType;
  is_featured: boolean;
  is_breaking: boolean;
  is_trending: boolean;
  views_count: number;
  read_time: number;
  comment_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  has_video: boolean;
  video_url?: string;
  video_thumbnail?: string;
}

export interface ArticleCreateRequest {
  title: string;
  subtitle?: string;
  summary: string;
  content: string;
  author: number;
  category: number;
  tags?: number[];
  featured_image?: number;
  status: ArticleStatus;
  visibility?: ArticleVisibility;
  article_type?: ArticleType;
  is_featured?: boolean;
  is_breaking?: boolean;
  published_at?: string;
  video_url?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export interface ArticleUpdateRequest {
  title?: string;
  subtitle?: string;
  summary?: string;
  content?: string;
  author?: number;
  category?: number;
  tags?: number[];
  featured_image?: number;
  status?: ArticleStatus;
  visibility?: ArticleVisibility;
  article_type?: ArticleType;
  is_featured?: boolean;
  is_breaking?: boolean;
  published_at?: string;
  video_url?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export interface PaginatedArticles {
  count: number;
  next?: string;
  previous?: string;
  results: ArticleListItem[];
}
