/**
 * Analytics Type Definitions
 */

// Dashboard Stats
export interface DashboardStats {
  totalArticles: number;
  totalUsers: number;
  totalViews: number;
  totalComments: number;
  todayVsYesterday: {
    articles: number; // percentage change
    views: number;
    comments: number;
  };
  trends: TrendData[];
  topArticles: TopArticle[];
  topAuthors: TopAuthor[];
  categoryPerformance: CategoryPerformance[];
}

export interface TrendData {
  date: Date;
  views: number;
  articles: number;
  comments: number;
}

export interface TopArticle {
  id: number;
  title: string;
  slug: string;
  views: number;
  likes: number;
  comments: number;
}

export interface TopAuthor {
  id: number;
  name: string;
  avatar: string | null;
  articlesCount: number;
  totalViews: number;
}

export interface CategoryPerformance {
  id: number;
  name: string;
  articlesCount: number;
  totalViews: number;
}

// API Response
export interface DashboardStatsApiResponse {
  total_articles: number;
  total_users: number;
  total_views: number;
  total_comments: number;
  today_stats: {
    articles: number;
    views: number;
    comments: number;
  };
  yesterday_stats: {
    articles: number;
    views: number;
    comments: number;
  };
  last_7_days: Array<{
    date: string;
    views: number;
    articles: number;
    comments: number;
  }>;
  top_articles: Array<{
    id: number;
    title: string;
    slug: string;
    views: number;
    likes: number;
    comments: number;
  }>;
  top_authors: Array<{
    id: number;
    name: string;
    avatar: string | null;
    articles_count: number;
    total_views: number;
  }>;
  category_performance: Array<{
    id: number;
    name: string;
    articles_count: number;
    total_views: number;
  }>;
}
