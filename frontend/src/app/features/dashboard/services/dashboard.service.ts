/**
 * Dashboard Service
 *
 * Manages dashboard data with Signals + RxJS hybrid pattern
 * - Private: RxJS Subjects for async operations
 * - Public: Signals (toSignal) for reactive state
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { HttpService } from '../../../core/services/http.service';
import { API_ENDPOINTS } from '../../../shared/constants/api.constants';
import {
  DashboardStats,
  RecentActivity,
  PopularArticle,
} from '../types/dashboard.types';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpService);

  // Private RxJS Subjects (internal async state)
  private readonly statsSubject = new BehaviorSubject<DashboardStats | null>(null);
  private readonly recentActivitiesSubject = new BehaviorSubject<RecentActivity[]>([]);
  private readonly popularArticlesSubject = new BehaviorSubject<PopularArticle[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // Public Observables (expose as signals or observables)
  readonly stats$: Observable<DashboardStats | null> = this.statsSubject.asObservable();
  readonly recentActivities$: Observable<RecentActivity[]> = this.recentActivitiesSubject.asObservable();
  readonly popularArticles$: Observable<PopularArticle[]> = this.popularArticlesSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly error$: Observable<string | null> = this.errorSubject.asObservable();

  /**
   * Load dashboard stats
   */
  loadStats(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.http
      .get<any>(API_ENDPOINTS.dashboard.stats)
      .pipe(
        tap(response => {
          const stats: DashboardStats = {
            totalArticles: response.total_articles || 0,
            totalUsers: response.total_users || 0,
            totalComments: response.total_comments || 0,
            totalViews: response.total_views || 0,
            articlesTrend: response.articles_trend || 0,
            usersTrend: response.users_trend || 0,
            commentsTrend: response.comments_trend || 0,
            viewsTrend: response.views_trend || 0,
          };
          this.statsSubject.next(stats);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Failed to load dashboard stats:', error);
          this.errorSubject.next('İstatistikler yüklenemedi');
          this.loadingSubject.next(false);

          // Return mock data for development
          const mockStats: DashboardStats = {
            totalArticles: 142,
            totalUsers: 1234,
            totalComments: 567,
            totalViews: 45678,
            articlesTrend: 12.5,
            usersTrend: 8.3,
            commentsTrend: -3.2,
            viewsTrend: 15.7,
          };
          this.statsSubject.next(mockStats);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Load recent activities
   */
  loadRecentActivities(limit: number = 10): void {
    this.http
      .get<any[]>(API_ENDPOINTS.dashboard.recentActivities, { limit })
      .pipe(
        tap(response => {
          const activities: RecentActivity[] = response.map(item => ({
            id: item.id,
            type: item.type,
            title: item.title,
            description: item.description,
            user: {
              id: item.user.id,
              name: item.user.name,
              avatar: item.user.avatar,
            },
            timestamp: new Date(item.timestamp),
            link: item.link,
          }));
          this.recentActivitiesSubject.next(activities);
        }),
        catchError(error => {
          console.error('Failed to load recent activities:', error);

          // Return mock data for development
          const mockActivities: RecentActivity[] = [
            {
              id: 1,
              type: 'article_published',
              title: 'Yeni makale yayınlandı',
              description: 'Angular 17 Yenilikleri makalesi yayınlandı',
              user: { id: 1, name: 'Ahmet Yılmaz' },
              timestamp: new Date(Date.now() - 1000 * 60 * 5),
              link: '/admin/articles/1',
            },
            {
              id: 2,
              type: 'comment_created',
              title: 'Yeni yorum eklendi',
              description: 'React vs Vue karşılaştırması makalesine yorum yapıldı',
              user: { id: 2, name: 'Ayşe Kaya' },
              timestamp: new Date(Date.now() - 1000 * 60 * 15),
              link: '/admin/comments/2',
            },
            {
              id: 3,
              type: 'user_registered',
              title: 'Yeni kullanıcı kaydı',
              description: 'Mehmet Demir sisteme kaydoldu',
              user: { id: 3, name: 'Mehmet Demir' },
              timestamp: new Date(Date.now() - 1000 * 60 * 30),
              link: '/admin/users/3',
            },
            {
              id: 4,
              type: 'article_updated',
              title: 'Makale güncellendi',
              description: 'TypeScript Best Practices makalesi güncellendi',
              user: { id: 1, name: 'Ahmet Yılmaz' },
              timestamp: new Date(Date.now() - 1000 * 60 * 45),
              link: '/admin/articles/4',
            },
            {
              id: 5,
              type: 'comment_approved',
              title: 'Yorum onaylandı',
              description: 'JavaScript ES2024 makalesindeki yorum onaylandı',
              user: { id: 4, name: 'Fatma Şahin' },
              timestamp: new Date(Date.now() - 1000 * 60 * 60),
              link: '/admin/comments/5',
            },
          ];
          this.recentActivitiesSubject.next(mockActivities);
          return of([]);
        })
      )
      .subscribe();
  }

  /**
   * Load popular articles
   */
  loadPopularArticles(limit: number = 5): void {
    this.http
      .get<any[]>(API_ENDPOINTS.dashboard.popularArticles, { limit })
      .pipe(
        tap(response => {
          const articles: PopularArticle[] = response.map(item => ({
            id: item.id,
            title: item.title,
            author: item.author.name,
            publishedAt: new Date(item.published_at),
            views: item.views,
            comments: item.comments_count,
          }));
          this.popularArticlesSubject.next(articles);
        }),
        catchError(error => {
          console.error('Failed to load popular articles:', error);

          // Return mock data for development
          const mockArticles: PopularArticle[] = [
            {
              id: 1,
              title: 'Angular 17 Signals: Kapsamlı Rehber',
              author: 'Ahmet Yılmaz',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
              views: 5432,
              comments: 23,
            },
            {
              id: 2,
              title: 'TypeScript 5.0 ile Gelen Yenilikler',
              author: 'Ayşe Kaya',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
              views: 4321,
              comments: 18,
            },
            {
              id: 3,
              title: 'Modern JavaScript: ES2024 Özellikleri',
              author: 'Mehmet Demir',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
              views: 3876,
              comments: 15,
            },
            {
              id: 4,
              title: 'React Server Components Detaylı İnceleme',
              author: 'Fatma Şahin',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
              views: 3245,
              comments: 12,
            },
            {
              id: 5,
              title: 'Vue 3 Composition API Best Practices',
              author: 'Ali Özkan',
              publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
              views: 2987,
              comments: 9,
            },
          ];
          this.popularArticlesSubject.next(mockArticles);
          return of([]);
        })
      )
      .subscribe();
  }

  /**
   * Refresh all dashboard data
   */
  refreshAll(): void {
    this.loadStats();
    this.loadRecentActivities();
    this.loadPopularArticles();
  }
}
