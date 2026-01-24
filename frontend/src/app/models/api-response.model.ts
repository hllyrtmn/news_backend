// Generic API response models

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface ApiError {
  error: boolean;
  message: string;
  details?: any;
  status_code?: number;
}

export interface ApiSuccess {
  success: boolean;
  message: string;
  data?: any;
}

// Search response
export interface SearchResponse {
  articles: any[];
  authors: any[];
  categories: any[];
  tags: any[];
  total_count: number;
  query: string;
}

export interface SearchAutocompleteResponse {
  suggestions: {
    articles: { id: number; title: string; slug: string }[];
    authors: { id: number; display_name: string; slug: string }[];
    categories: { id: number; name: string; slug: string }[];
  };
  query: string;
}

export interface SearchSuggestionsResponse {
  trending_topics: any[];
  popular_searches: any[];
}

// Analytics
export interface AnalyticsDashboard {
  general: {
    total_articles: number;
    total_users: number;
    total_comments: number;
    total_views: number;
  };
  today: {
    articles: number;
    users: number;
    comments: number;
    views: number;
  };
  yesterday: {
    articles: number;
    users: number;
    comments: number;
    views: number;
  };
  comparison: {
    articles_change: number;
    users_change: number;
    comments_change: number;
    views_change: number;
  };
  trends: {
    dates: string[];
    articles: number[];
    views: number[];
    comments: number[];
    users: number[];
  };
  top_articles_7d: any[];
  top_authors: any[];
}

// Bookmark
export interface Bookmark {
  id: number;
  user: number;
  article: number;
  created_at: string;
}

export interface ReadingList {
  id: number;
  user: number;
  name: string;
  description: string;
  is_public: boolean;
  articles: number[];
  created_at: string;
  updated_at: string;
}

// Newsletter
export interface NewsletterSubscription {
  id: number;
  email: string;
  is_active: boolean;
  subscribed_at: string;
}
