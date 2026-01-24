import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/api/api.service';
import { AnalyticsDashboard } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private api = inject(ApiService);

  /**
   * Get admin dashboard analytics (admin only)
   */
  getDashboard(): Observable<AnalyticsDashboard> {
    return this.api.get<AnalyticsDashboard>('analytics/dashboard/');
  }

  /**
   * Get article analytics
   */
  getArticleAnalytics(articleSlug: string): Observable<{
    views: number;
    views_trend: number[];
    comments: number;
    likes: number;
  }> {
    return this.api.get(`analytics/article/${articleSlug}/`);
  }

  /**
   * Get user analytics (for authors)
   */
  getUserAnalytics(): Observable<{
    total_articles: number;
    total_views: number;
    total_comments: number;
    popular_articles: any[];
  }> {
    return this.api.get('analytics/user/');
  }
}
