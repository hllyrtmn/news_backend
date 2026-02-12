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

    if (params.search) queryParams['search'] = params.search;
    if (params.status) queryParams['status'] = params.status;
    if (params.category) queryParams['category'] = params.category;
    if (params.author) queryParams['author'] = params.author;
    if (params.sort) queryParams['ordering'] = params.order === 'desc' ? `-${params.sort}` : params.sort;

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
