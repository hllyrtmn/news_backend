// Tag models

export interface Tag {
  id: number;
  name: string;
  slug: string;
  article_count: number;
  created_at: string;
}

export interface TrendingTag extends Tag {
  trend_score: number;
}
