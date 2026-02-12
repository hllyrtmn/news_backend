/**
 * Tag Service (Admin)
 *
 * Manages tags with CRUD operations for admin panel
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap, map } from 'rxjs';
import { HttpService } from '../../../core/services/http.service';
import { NotificationHelper } from '../../../shared/helpers/notification.helper';

export interface Tag {
  id: number;
  name: string;
  slug: string;
  articleCount: number;
  createdAt?: string;
}

export interface TagFormData {
  name: string;
  slug: string;
}

interface TagListParams {
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class AdminTagService {
  private readonly http = inject(HttpService);

  // Private RxJS Subjects
  private readonly tagsSubject = new BehaviorSubject<Tag[]>([]);
  private readonly totalCountSubject = new BehaviorSubject<number>(0);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // Public Observables
  readonly tags$: Observable<Tag[]> = this.tagsSubject.asObservable();
  readonly totalCount$: Observable<number> = this.totalCountSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly error$: Observable<string | null> = this.errorSubject.asObservable();

  /**
   * Load tags list
   */
  loadTags(params: TagListParams = {}): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const queryParams: Record<string, any> = {};
    if (params.search) queryParams['search'] = params.search;
    if (params.sort) queryParams['ordering'] = params.order === 'desc' ? `-${params.sort}` : params.sort;

    this.http
      .get<any[]>('tags/', queryParams)
      .pipe(
        tap(response => {
          const tags = response.map(item => this.mapToDomain(item));
          this.tagsSubject.next(tags);
          this.totalCountSubject.next(tags.length);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Failed to load tags:', error);
          this.errorSubject.next('Etiketler yüklenemedi');
          this.loadingSubject.next(false);
          NotificationHelper.showError('Etiketler yüklenemedi');

          // Mock data for development
          const mockTags: Tag[] = [
            { id: 1, name: 'Angular', slug: 'angular', articleCount: 25 },
            { id: 2, name: 'TypeScript', slug: 'typescript', articleCount: 18 },
            { id: 3, name: 'JavaScript', slug: 'javascript', articleCount: 32 },
          ];
          this.tagsSubject.next(mockTags);
          this.totalCountSubject.next(mockTags.length);
          return of([]);
        })
      )
      .subscribe();
  }

  /**
   * Get single tag by ID
   */
  getTag(id: number): Observable<Tag | null> {
    return this.http.get<any>(`tags/${id}/`).pipe(
      map(response => this.mapToDomain(response)),
      catchError(error => {
        console.error('Failed to load tag:', error);
        NotificationHelper.showError('Etiket yüklenemedi');
        return of(null);
      })
    );
  }

  /**
   * Create new tag
   */
  createTag(formData: TagFormData): Observable<Tag | null> {
    return this.http.post<any>('tags/', formData).pipe(
      map(response => {
        const tag = this.mapToDomain(response);
        NotificationHelper.showSuccess('Etiket başarıyla oluşturuldu');
        return tag;
      }),
      catchError(error => {
        console.error('Failed to create tag:', error);
        NotificationHelper.showError('Etiket oluşturulamadı');
        return of(null);
      })
    );
  }

  /**
   * Update existing tag
   */
  updateTag(id: number, formData: TagFormData): Observable<Tag | null> {
    return this.http.put<any>(`tags/${id}/`, formData).pipe(
      map(response => {
        const tag = this.mapToDomain(response);
        NotificationHelper.showSuccess('Etiket başarıyla güncellendi');
        return tag;
      }),
      catchError(error => {
        console.error('Failed to update tag:', error);
        NotificationHelper.showError('Etiket güncellenemedi');
        return of(null);
      })
    );
  }

  /**
   * Delete tag
   */
  deleteTag(id: number): Observable<boolean> {
    return this.http.delete(`tags/${id}/`).pipe(
      map(() => {
        NotificationHelper.showSuccess('Etiket başarıyla silindi');
        return true;
      }),
      catchError(error => {
        console.error('Failed to delete tag:', error);
        NotificationHelper.showError('Etiket silinemedi');
        return of(false);
      })
    );
  }

  /**
   * Refresh tags list
   */
  refresh(): void {
    this.loadTags();
  }

  /**
   * Map API response to domain model
   */
  private mapToDomain(apiData: any): Tag {
    return {
      id: apiData.id,
      name: apiData.name,
      slug: apiData.slug,
      articleCount: apiData.article_count || 0,
      createdAt: apiData.created_at,
    };
  }
}
