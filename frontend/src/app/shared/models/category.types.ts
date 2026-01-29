/**
 * Category Types
 *
 * Type definitions for categories
 */

// Domain Model (Frontend)
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  articleCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// API Response (Backend)
export interface CategoryApiResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  article_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Form Data
export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  color?: string;
}
