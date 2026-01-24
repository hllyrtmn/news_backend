// User models based on backend CustomUser

export type UserType = 'admin' | 'editor' | 'author' | 'subscriber' | 'reader' | 'premium';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar?: string;
  bio: string;
  phone: string;
  birth_date?: string;
  user_type: UserType;
  is_verified: boolean;
  two_factor_enabled: boolean;
  date_joined: string;
}

export interface AuthorProfile {
  id: number;
  user: User;
  display_name: string;
  slug: string;
  title: string;
  specialty: string;
  bio_long: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_instagram?: string;
  social_facebook?: string;
  website?: string;
  total_articles: number;
  total_views: number;
  average_rating: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreference {
  email_notifications: boolean;
  push_notifications: boolean;
  newsletter_subscribed: boolean;
  language: 'tr' | 'en';
  theme: 'light' | 'dark' | 'auto';
  font_size: string;
  preferred_categories: PreferredCategory[];
}

export interface PreferredCategory {
  id: number;
  category: number;
  category_name: string;
  category_slug: string;
  order: number;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  bio: string;
  phone: string;
  birth_date?: string;
  user_type: UserType;
  is_verified: boolean;
  date_joined: string;
  preferences: UserPreference;
  author_profile?: AuthorProfile;
}
