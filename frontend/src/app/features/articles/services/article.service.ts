/**
 * Article Service
 *
 * Manages articles with Signals + RxJS hybrid pattern
 * - Private: RxJS Subjects for async operations
 * - Public: Observables for reactive state
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap, map } from 'rxjs';
import { HttpService } from '../../../core/services/http.service';
import { API_ENDPOINTS } from '../../../shared/constants/api.constants';
import { Article, ArticleApiResponse, ArticleFormData } from '../../../shared/models/article.types';
import { ArticleMapper } from '../../../shared/mappers/article.mapper';
import { NotificationHelper } from '../../../shared/helpers/notification.helper';

interface ArticleListParams {
  page?: number;
  search?: string;
  status?: string;
  category?: number;
  author?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private readonly http = inject(HttpService);

  // Private RxJS Subjects (internal async state)
  private readonly articlesSubject = new BehaviorSubject<Article[]>([]);
  private readonly totalCountSubject = new BehaviorSubject<number>(0);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // Public Observables
  readonly articles$: Observable<Article[]> = this.articlesSubject.asObservable();
  readonly totalCount$: Observable<number> = this.totalCountSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly error$: Observable<string | null> = this.errorSubject.asObservable();

  /**
   * Load articles list with filters and pagination
   */
  loadArticles(params: ArticleListParams = {}): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const queryParams: Record<string, any> = {
      page: params.page || 1,
      page_size: 20,
    };

    if (params.search) queryParams.search = params.search;
    if (params.status) queryParams.status = params.status;
    if (params.category) queryParams.category = params.category;
    if (params.author) queryParams.author = params.author;
    if (params.sort) queryParams.ordering = params.order === 'desc' ? `-${params.sort}` : params.sort;

    this.http
      .get<{ results: ArticleApiResponse[]; count: number }>(
        API_ENDPOINTS.articles.list,
        queryParams
      )
      .pipe(
        tap(response => {
          const articles = response.results.map(item => ArticleMapper.toDomain(item));
          this.articlesSubject.next(articles);
          this.totalCountSubject.next(response.count);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Failed to load articles:', error);
          this.errorSubject.next('Makaleler yüklenemedi');
          this.loadingSubject.next(false);
          NotificationHelper.showError('Makaleler yüklenemedi');

          // Return mock data for development
          const mockArticles: Article[] = [
            {
              id: 1,
              title: 'Angular 17 Signals ile State Management',
              slug: 'angular-17-signals-state-management',
              excerpt: 'Angular 17 ile gelen Signals özelliği ile modern state management nasıl yapılır?',
              content: 'Lorem ipsum...',
              featuredImage: null,
              status: 'published',
              author: {
                id: 1,
                username: 'ahmetyilmaz',
                email: 'ahmet@example.com',
                fullName: 'Ahmet Yılmaz',
                isActive: true,
              },
              category: { id: 1, name: 'Angular', slug: 'angular' },
              tags: [
                { id: 1, name: 'Angular', slug: 'angular' },
                { id: 2, name: 'TypeScript', slug: 'typescript' },
              ],
              viewCount: 1234,
              likeCount: 45,
              commentCount: 12,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
              updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
              publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
            },
            {
              id: 2,
              title: 'TypeScript 5.0 Yenilikleri',
              slug: 'typescript-5-yenilikleri',
              excerpt: 'TypeScript 5.0 ile gelen yenilikler ve breaking changes',
              content: 'Lorem ipsum...',
              featuredImage: null,
              status: 'published',
              author: {
                id: 2,
                username: 'ayse',
                email: 'ayse@example.com',
                fullName: 'Ayşe Kaya',
                isActive: true,
              },
              category: { id: 2, name: 'TypeScript', slug: 'typescript' },
              tags: [{ id: 2, name: 'TypeScript', slug: 'typescript' }],
              viewCount: 987,
              likeCount: 32,
              commentCount: 8,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
              updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
              publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
            },
            {
              id: 3,
              title: 'React Server Components Detaylı İnceleme',
              slug: 'react-server-components',
              excerpt: 'React Server Components nedir, nasıl çalışır?',
              content: 'Lorem ipsum...',
              featuredImage: null,
              status: 'draft',
              author: {
                id: 1,
                username: 'ahmetyilmaz',
                email: 'ahmet@example.com',
                fullName: 'Ahmet Yılmaz',
                isActive: true,
              },
              category: { id: 3, name: 'React', slug: 'react' },
              tags: [{ id: 3, name: 'React', slug: 'react' }],
              viewCount: 0,
              likeCount: 0,
              commentCount: 0,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
              updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
              publishedAt: null,
            },
          ];
          this.articlesSubject.next(mockArticles);
          this.totalCountSubject.next(mockArticles.length);
          return of({ results: [], count: 0 });
        })
      )
      .subscribe();
  }

  /**
   * Get single article by ID
   */
  getArticle(id: number): Observable<Article | null> {
    return this.http.get<ArticleApiResponse>(API_ENDPOINTS.articles.detail(id)).pipe(
      map(response => ArticleMapper.toDomain(response)),
      catchError(error => {
        console.error('Failed to load article:', error);
        NotificationHelper.showError('Makale yüklenemedi');
        return of(null);
      })
    );
  }

  /**
   * Create new article
   */
  createArticle(formData: ArticleFormData): Observable<Article | null> {
    const apiData = ArticleMapper.toApiRequest(formData);

    return this.http.post<ArticleApiResponse>(API_ENDPOINTS.articles.create, apiData).pipe(
      map(response => {
        const article = ArticleMapper.toDomain(response);
        NotificationHelper.showSuccess('Makale başarıyla oluşturuldu');
        return article;
      }),
      catchError(error => {
        console.error('Failed to create article:', error);
        NotificationHelper.showError('Makale oluşturulamadı');
        return of(null);
      })
    );
  }

  /**
   * Update existing article
   */
  updateArticle(id: number, formData: ArticleFormData): Observable<Article | null> {
    const apiData = ArticleMapper.toApiRequest(formData);

    return this.http.put<ArticleApiResponse>(API_ENDPOINTS.articles.update(id), apiData).pipe(
      map(response => {
        const article = ArticleMapper.toDomain(response);
        NotificationHelper.showSuccess('Makale başarıyla güncellendi');
        return article;
      }),
      catchError(error => {
        console.error('Failed to update article:', error);
        NotificationHelper.showError('Makale güncellenemedi');
        return of(null);
      })
    );
  }

  /**
   * Delete article
   */
  deleteArticle(id: number): Observable<boolean> {
    return this.http.delete(API_ENDPOINTS.articles.delete(id)).pipe(
      map(() => {
        NotificationHelper.showSuccess('Makale başarıyla silindi');
        return true;
      }),
      catchError(error => {
        console.error('Failed to delete article:', error);
        NotificationHelper.showError('Makale silinemedi');
        return of(false);
      })
    );
  }

  /**
   * Bulk publish articles
   */
  bulkPublishArticles(ids: number[]): Observable<boolean> {
    return this.http.post(API_ENDPOINTS.articles.bulkPublish, { ids }).pipe(
      map(() => {
        NotificationHelper.showSuccess(`${ids.length} makale yayınlandı`);
        return true;
      }),
      catchError(error => {
        console.error('Failed to bulk publish:', error);
        NotificationHelper.showError('Makaleler yayınlanamadı');
        return of(false);
      })
    );
  }

  /**
   * Bulk delete articles
   */
  bulkDeleteArticles(ids: number[]): Observable<boolean> {
    return this.http.post(API_ENDPOINTS.articles.bulkDelete, { ids }).pipe(
      map(() => {
        NotificationHelper.showSuccess(`${ids.length} makale silindi`);
        return true;
      }),
      catchError(error => {
        console.error('Failed to bulk delete:', error);
        NotificationHelper.showError('Makaleler silinemedi');
        return of(false);
      })
    );
  }

  /**
   * Refresh articles list
   */
  refresh(): void {
    this.loadArticles();
  }
}
