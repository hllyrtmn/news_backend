/**
 * Analytics Mapper
 *
 * Transform data between API and Domain models
 */

import {
  DashboardStats,
  DashboardStatsApiResponse,
} from '../models/analytics.types';

export class AnalyticsMapper {
  /**
   * Transform Dashboard stats API response to Domain model
   * @param apiData API response
   * @returns Domain model
   */
  static mapDashboardStats(apiData: DashboardStatsApiResponse): DashboardStats {
    return {
      totalArticles: apiData.total_articles,
      totalUsers: apiData.total_users,
      totalViews: apiData.total_views,
      totalComments: apiData.total_comments,
      todayVsYesterday: {
        articles: this.calculateChange(
          apiData.today_stats.articles,
          apiData.yesterday_stats.articles
        ),
        views: this.calculateChange(
          apiData.today_stats.views,
          apiData.yesterday_stats.views
        ),
        comments: this.calculateChange(
          apiData.today_stats.comments,
          apiData.yesterday_stats.comments
        ),
      },
      trends: apiData.last_7_days.map((day) => ({
        date: new Date(day.date),
        views: day.views,
        articles: day.articles,
        comments: day.comments,
      })),
      topArticles: apiData.top_articles.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        views: article.views,
        likes: article.likes,
        comments: article.comments,
      })),
      topAuthors: apiData.top_authors.map((author) => ({
        id: author.id,
        name: author.name,
        avatar: author.avatar,
        articlesCount: author.articles_count,
        totalViews: author.total_views,
      })),
      categoryPerformance: apiData.category_performance.map((category) => ({
        id: category.id,
        name: category.name,
        articlesCount: category.articles_count,
        totalViews: category.total_views,
      })),
    };
  }

  /**
   * Calculate percentage change between two values
   * @param current Current value
   * @param previous Previous value
   * @returns Percentage change
   */
  private static calculateChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  }
}
