/**
 * Comment Types
 *
 * Type definitions for comments and moderation
 */

// Domain Model (Frontend)
export interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    fullName: string;
    avatar?: string;
  };
  article: {
    id: number;
    title: string;
    slug: string;
  };
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
  moderatedBy?: {
    id: number;
    username: string;
    fullName: string;
  };
  moderatedAt?: Date;
  moderationNote?: string;
}

// API Response (Backend)
export interface CommentApiResponse {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    full_name: string;
    avatar?: string;
  };
  article: {
    id: number;
    title: string;
    slug: string;
  };
  status: CommentStatus;
  created_at: string;
  updated_at: string;
  moderated_by?: {
    id: number;
    username: string;
    full_name: string;
  };
  moderated_at?: string;
  moderation_note?: string;
}

// Comment Status
export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';

// Comment Form Data
export interface CommentFormData {
  content: string;
  articleId: number;
}

// Moderation Action
export interface ModerationAction {
  status: CommentStatus;
  note?: string;
}
