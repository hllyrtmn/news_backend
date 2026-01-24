import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/api/api.service';
import { Category } from '../models/category.model';
import { Article } from '../models/article.model';
import { PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private api = inject(ApiService);

  /**
   * Get all categories
   */
  getCategories(): Observable<Category[]> {
    return this.api.get<Category[]>('categories/');
  }

  /**
   * Get single category by slug
   */
  getCategory(slug: string): Observable<Category> {
    return this.api.get<Category>(`categories/${slug}/`);
  }

  /**
   * Get articles in a category
   */
  getCategoryArticles(slug: string, params?: {
    page?: number;
    limit?: number;
    ordering?: string;
  }): Observable<PaginatedResponse<Article>> {
    return this.api.get<PaginatedResponse<Article>>(`categories/${slug}/articles/`, params);
  }

  /**
   * Get popular categories (by article count)
   */
  getPopularCategories(limit: number = 10): Observable<Category[]> {
    return this.api.get<Category[]>('categories/popular/', { limit });
  }
}
