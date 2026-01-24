// Comment models

import { User } from './user.model';

export type CommentStatus = 'pending' | 'approved' | 'spam' | 'rejected';

export interface Comment {
  id: number;
  article: number;
  user?: User;
  parent?: number;
  name: string;
  email: string;
  content: string;
  status: CommentStatus;
  ip_address?: string;
  user_agent?: string;
  likes_count: number;
  dislikes_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface CommentCreateRequest {
  article: number;
  parent?: number;
  content: string;
  name?: string;
  email?: string;
}

export interface CommentModerationStats {
  total: number;
  approved: number;
  pending: number;
  spam: number;
  rejected: number;
}

export interface CommentAnalysis {
  comment_id: number;
  current_status: CommentStatus;
  recommended_status: CommentStatus;
  reason: string;
  scores: {
    spam_score: number;
    profanity_score: number;
    total_score: number;
  };
  flags: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    details: string;
  }[];
}
