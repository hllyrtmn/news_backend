// Notification models

import { User } from './user.model';

export type NotificationType = 'comment' | 'reply' | 'like' | 'follow' | 'article' | 'mention' | 'system';

export interface Notification {
  id: number;
  recipient: number;
  sender?: User;
  notification_type: NotificationType;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface NotificationPreference {
  // Email notifications
  email_on_comment: boolean;
  email_on_reply: boolean;
  email_on_like: boolean;
  email_on_follow: boolean;
  email_on_mention: boolean;

  // Push notifications
  push_on_comment: boolean;
  push_on_reply: boolean;
  push_on_like: boolean;
  push_on_follow: boolean;
  push_on_mention: boolean;

  // In-app notifications
  inapp_on_comment: boolean;
  inapp_on_reply: boolean;
  inapp_on_like: boolean;
  inapp_on_follow: boolean;
  inapp_on_mention: boolean;
}

// Alias for plural form
export type NotificationPreferences = NotificationPreference;

export interface NotificationWebSocketMessage {
  type: 'connection_established' | 'unread_count' | 'notification' | 'notification_read' | 'all_notifications_read' | 'error';
  notification?: {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    link: string;
    sender?: string;
    created_at: string;
  };
  count?: number;
  notification_id?: number;
  message?: string;
}

export interface BreakingNewsWebSocketMessage {
  type: 'connection_established' | 'breaking_news';
  article?: {
    id: number;
    title: string;
    slug: string;
    summary: string;
    featured_image?: string;
  };
  message?: string;
}
