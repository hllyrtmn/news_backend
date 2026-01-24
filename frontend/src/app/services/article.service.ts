import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/api/api.service';
import { Article, ArticleCreateRequest, ArticleUpdateRequest } from '../models/article.model';
import { PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private api = inject(ApiService);

  /**
   * Get paginated list of articles
   */
  getArticles(params?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    author?: string;
    status?: string;
    visibility?: string;
    type?: string;
    ordering?: string;
  }): Observable<PaginatedResponse<Article>> {
    return this.api.get<PaginatedResponse<Article>>('articles/', params);
  }

  /**
   * Get single article by slug
   */
  getArticle(slug: string): Observable<Article> {
    return this.api.get<Article>(`articles/${slug}/`);
  }

  /**
   * Get featured articles (homepage sliders)
   */
  getFeaturedArticles(limit: number = 5): Observable<Article[]> {
    return this.api.get<Article[]>('articles/featured/', { limit });
  }

  /**
   * Get breaking news articles
   */
  getBreakingNews(limit: number = 3): Observable<Article[]> {
    return this.api.get<Article[]>('articles/breaking_news/', { limit });
  }

  /**
   * Get popular articles (by views)
   */
  getPopularArticles(limit: number = 10, days: number = 7): Observable<Article[]> {
    return this.api.get<Article[]>('articles/popular/', { limit, days });
  }

  /**
   * Get trending articles (by engagement)
   */
  getTrendingArticles(limit: number = 10): Observable<Article[]> {
    return this.api.get<Article[]>('articles/trending/', { limit });
  }

  /**
   * Get column articles (köşe yazıları)
   */
  getColumnArticles(params?: { page?: number; limit?: number }): Observable<PaginatedResponse<Article>> {
    return this.api.get<PaginatedResponse<Article>>('articles/columns/', params);
  }

  /**
   * Get related articles
   */
  getRelatedArticles(slug: string, limit: number = 5): Observable<Article[]> {
    return this.api.get<Article[]>(`articles/${slug}/related/`, { limit });
  }

  /**
   * Create new article (requires authentication)
   */
  createArticle(data: ArticleCreateRequest): Observable<Article> {
    return this.api.post<Article>('articles/', data);
  }

  /**
   * Update article (requires authentication)
   */
  updateArticle(slug: string, data: ArticleUpdateRequest): Observable<Article> {
    return this.api.patch<Article>(`articles/${slug}/`, data);
  }

  /**
   * Delete article (requires authentication)
   */
  deleteArticle(slug: string): Observable<void> {
    return this.api.delete<void>(`articles/${slug}/`);
  }

  /**
   * Increment article view count
   */
  incrementView(slug: string): Observable<void> {
    return this.api.post<void>(`articles/${slug}/increment_view/`, {});
  }

  /**
   * Upload article image
   */
  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.api.upload<{ url: string }>('articles/upload_image/', formData);
  }

  /**
   * Upload video file
   */
  uploadVideo(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('video', file);
    return this.api.upload<{ url: string }>('articles/upload_video/', formData);
  }
}
