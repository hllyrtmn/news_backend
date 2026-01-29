/**
 * Dashboard Types
 *
 * Type definitions for dashboard data
 */

export interface DashboardStats {
  totalArticles: number;
  totalUsers: number;
  totalComments: number;
  totalViews: number;
  articlesTrend: number; // percentage change
  usersTrend: number;
  commentsTrend: number;
  viewsTrend: number;
}

export interface RecentActivity {
  id: number;
  type: ActivityType;
  title: string;
  description: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  link?: string;
}

export type ActivityType =
  | 'article_created'
  | 'article_published'
  | 'article_updated'
  | 'comment_created'
  | 'comment_approved'
  | 'comment_rejected'
  | 'user_registered'
  | 'user_updated'
  | 'category_created'
  | 'tag_created';

export interface PopularArticle {
  id: number;
  title: string;
  author: string;
  publishedAt: Date;
  views: number;
  comments: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}
