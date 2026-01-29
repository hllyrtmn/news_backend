/**
 * Category Service
 *
 * Manages categories with Signals + RxJS hybrid pattern
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap, map } from 'rxjs';
import { HttpService } from '../../../core/services/http.service';
import { API_ENDPOINTS } from '../../../shared/constants/api.constants';
import { Category, CategoryApiResponse, CategoryFormData } from '../../../shared/models/category.types';
import { CategoryMapper } from '../../../shared/mappers/category.mapper';
import { NotificationHelper } from '../../../shared/helpers/notification.helper';

interface CategoryListParams {
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpService);

  // Private RxJS Subjects
  private readonly categoriesSubject = new BehaviorSubject<Category[]>([]);
  private readonly totalCountSubject = new BehaviorSubject<number>(0);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // Public Observables
  readonly categories$: Observable<Category[]> = this.categoriesSubject.asObservable();
  readonly totalCount$: Observable<number> = this.totalCountSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly error$: Observable<string | null> = this.errorSubject.asObservable();

  /**
   * Load categories list
   */
  loadCategories(params: CategoryListParams = {}): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const queryParams: Record<string, any> = {};
    if (params.search) queryParams.search = params.search;
    if (params.sort) queryParams.ordering = params.order === 'desc' ? `-${params.sort}` : params.sort;

    this.http
      .get<CategoryApiResponse[]>(API_ENDPOINTS.categories.list, queryParams)
      .pipe(
        tap(response => {
          const categories = response.map(item => CategoryMapper.toDomain(item));
          this.categoriesSubject.next(categories);
          this.totalCountSubject.next(categories.length);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Failed to load categories:', error);
          this.errorSubject.next('Kategoriler yüklenemedi');
          this.loadingSubject.next(false);
          NotificationHelper.showError('Kategoriler yüklenemedi');

          // Mock data for development
          const mockCategories: Category[] = [
            {
              id: 1,
              name: 'Teknoloji',
              slug: 'teknoloji',
              description: 'Teknoloji haberleri ve yazıları',
              color: '#3b82f6',
              articleCount: 45,
            },
            {
              id: 2,
              name: 'Yazılım',
              slug: 'yazilim',
              description: 'Yazılım geliştirme ve programlama',
              color: '#10b981',
              articleCount: 32,
            },
            {
              id: 3,
              name: 'Tasarım',
              slug: 'tasarim',
              description: 'UI/UX ve grafik tasarım',
              color: '#8b5cf6',
              articleCount: 18,
            },
          ];
          this.categoriesSubject.next(mockCategories);
          this.totalCountSubject.next(mockCategories.length);
          return of([]);
        })
      )
      .subscribe();
  }

  /**
   * Get single category by ID
   */
  getCategory(id: number): Observable<Category | null> {
    return this.http.get<CategoryApiResponse>(API_ENDPOINTS.categories.detail(id)).pipe(
      map(response => CategoryMapper.toDomain(response)),
      catchError(error => {
        console.error('Failed to load category:', error);
        NotificationHelper.showError('Kategori yüklenemedi');
        return of(null);
      })
    );
  }

  /**
   * Create new category
   */
  createCategory(formData: CategoryFormData): Observable<Category | null> {
    const apiData = CategoryMapper.toApiRequest(formData);

    return this.http.post<CategoryApiResponse>(API_ENDPOINTS.categories.create, apiData).pipe(
      map(response => {
        const category = CategoryMapper.toDomain(response);
        NotificationHelper.showSuccess('Kategori başarıyla oluşturuldu');
        return category;
      }),
      catchError(error => {
        console.error('Failed to create category:', error);
        NotificationHelper.showError('Kategori oluşturulamadı');
        return of(null);
      })
    );
  }

  /**
   * Update existing category
   */
  updateCategory(id: number, formData: CategoryFormData): Observable<Category | null> {
    const apiData = CategoryMapper.toApiRequest(formData);

    return this.http.put<CategoryApiResponse>(API_ENDPOINTS.categories.update(id), apiData).pipe(
      map(response => {
        const category = CategoryMapper.toDomain(response);
        NotificationHelper.showSuccess('Kategori başarıyla güncellendi');
        return category;
      }),
      catchError(error => {
        console.error('Failed to update category:', error);
        NotificationHelper.showError('Kategori güncellenemedi');
        return of(null);
      })
    );
  }

  /**
   * Delete category
   */
  deleteCategory(id: number): Observable<boolean> {
    return this.http.delete(API_ENDPOINTS.categories.delete(id)).pipe(
      map(() => {
        NotificationHelper.showSuccess('Kategori başarıyla silindi');
        return true;
      }),
      catchError(error => {
        console.error('Failed to delete category:', error);
        NotificationHelper.showError('Kategori silinemedi');
        return of(false);
      })
    );
  }

  /**
   * Refresh categories list
   */
  refresh(): void {
    this.loadCategories();
  }
}
