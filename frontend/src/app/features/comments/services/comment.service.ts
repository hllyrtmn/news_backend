/**
 * Comment Service
 *
 * Manages comments and moderation with Signals + RxJS hybrid pattern
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap, map } from 'rxjs';
import { HttpService } from '../../../core/services/http.service';
import { API_ENDPOINTS } from '../../../shared/constants/api.constants';
import { Comment, CommentApiResponse, CommentStatus, ModerationAction } from '../../../shared/models/comment.types';
import { CommentMapper } from '../../../shared/mappers/comment.mapper';
import { NotificationHelper } from '../../../shared/helpers/notification.helper';

interface CommentListParams {
  page?: number;
  search?: string;
  status?: CommentStatus;
  articleId?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly http = inject(HttpService);

  // Private RxJS Subjects
  private readonly commentsSubject = new BehaviorSubject<Comment[]>([]);
  private readonly totalCountSubject = new BehaviorSubject<number>(0);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // Public Observables
  readonly comments$: Observable<Comment[]> = this.commentsSubject.asObservable();
  readonly totalCount$: Observable<number> = this.totalCountSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly error$: Observable<string | null> = this.errorSubject.asObservable();

  /**
   * Load comments list with filters and pagination
   */
  loadComments(params: CommentListParams = {}): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const queryParams: Record<string, any> = {
      page: params.page || 1,
      page_size: 20,
    };

    if (params.search) queryParams.search = params.search;
    if (params.status) queryParams.status = params.status;
    if (params.articleId) queryParams.article = params.articleId;
    if (params.sort) queryParams.ordering = params.order === 'desc' ? `-${params.sort}` : params.sort;

    this.http
      .get<{ results: CommentApiResponse[]; count: number }>(
        API_ENDPOINTS.comments.list,
        queryParams
      )
      .pipe(
        tap(response => {
          const comments = response.results.map(item => CommentMapper.toDomain(item));
          this.commentsSubject.next(comments);
          this.totalCountSubject.next(response.count);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Failed to load comments:', error);
          this.errorSubject.next('Yorumlar yüklenemedi');
          this.loadingSubject.next(false);
          NotificationHelper.showError('Yorumlar yüklenemedi');

          // Mock data for development
          const mockComments: Comment[] = [
            {
              id: 1,
              content: 'Harika bir makale, çok faydalı bilgiler var. Teşekkürler!',
              author: {
                id: 10,
                username: 'ahmet123',
                fullName: 'Ahmet Yılmaz',
              },
              article: {
                id: 1,
                title: 'Angular 17 Signals ile State Management',
                slug: 'angular-17-signals-state-management',
              },
              status: 'pending',
              createdAt: new Date(Date.now() - 1000 * 60 * 30),
              updatedAt: new Date(Date.now() - 1000 * 60 * 30),
            },
            {
              id: 2,
              content: 'Bu konuda daha detaylı bilgi verebilir misiniz?',
              author: {
                id: 11,
                username: 'ayse_k',
                fullName: 'Ayşe Kaya',
              },
              article: {
                id: 2,
                title: 'TypeScript 5.0 Yenilikleri',
                slug: 'typescript-5-yenilikleri',
              },
              status: 'pending',
              createdAt: new Date(Date.now() - 1000 * 60 * 60),
              updatedAt: new Date(Date.now() - 1000 * 60 * 60),
            },
            {
              id: 3,
              content: 'Çok güzel anlatmışsınız, eline sağlık!',
              author: {
                id: 12,
                username: 'mehmet_d',
                fullName: 'Mehmet Demir',
              },
              article: {
                id: 1,
                title: 'Angular 17 Signals ile State Management',
                slug: 'angular-17-signals-state-management',
              },
              status: 'approved',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
              updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
              moderatedBy: {
                id: 1,
                username: 'admin',
                fullName: 'Admin User',
              },
              moderatedAt: new Date(Date.now() - 1000 * 60 * 60),
            },
            {
              id: 4,
              content: 'Spam içerik!!! Tıklayın → buraya...',
              author: {
                id: 13,
                username: 'spammer',
                fullName: 'Spam User',
              },
              article: {
                id: 3,
                title: 'React Server Components',
                slug: 'react-server-components',
              },
              status: 'spam',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
              updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
              moderatedBy: {
                id: 1,
                username: 'admin',
                fullName: 'Admin User',
              },
              moderatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
              moderationNote: 'Spam içerik tespit edildi',
            },
          ];
          this.commentsSubject.next(mockComments);
          this.totalCountSubject.next(mockComments.length);
          return of({ results: [], count: 0 });
        })
      )
      .subscribe();
  }

  /**
   * Load pending comments
   */
  loadPendingComments(): void {
    this.loadComments({ status: 'pending' });
  }

  /**
   * Get single comment by ID
   */
  getComment(id: number): Observable<Comment | null> {
    return this.http.get<CommentApiResponse>(API_ENDPOINTS.comments.detail(id)).pipe(
      map(response => CommentMapper.toDomain(response)),
      catchError(error => {
        console.error('Failed to load comment:', error);
        NotificationHelper.showError('Yorum yüklenemedi');
        return of(null);
      })
    );
  }

  /**
   * Approve comment
   */
  approveComment(id: number, note?: string): Observable<boolean> {
    return this.moderateComment(id, { status: 'approved', note });
  }

  /**
   * Reject comment
   */
  rejectComment(id: number, note?: string): Observable<boolean> {
    return this.moderateComment(id, { status: 'rejected', note });
  }

  /**
   * Mark comment as spam
   */
  markAsSpam(id: number, note?: string): Observable<boolean> {
    return this.moderateComment(id, { status: 'spam', note });
  }

  /**
   * Moderate comment (generic)
   */
  private moderateComment(id: number, action: ModerationAction): Observable<boolean> {
    const endpoint =
      action.status === 'approved' ? API_ENDPOINTS.comments.approve(id) :
      action.status === 'rejected' ? API_ENDPOINTS.comments.reject(id) :
      API_ENDPOINTS.comments.detail(id);

    const data = action.note ? { note: action.note, status: action.status } : { status: action.status };

    return this.http.post(endpoint, data).pipe(
      map(() => {
        const statusMessages: Record<CommentStatus, string> = {
          pending: 'Yorum beklemede',
          approved: 'Yorum onaylandı',
          rejected: 'Yorum reddedildi',
          spam: 'Yorum spam olarak işaretlendi',
        };
        NotificationHelper.showSuccess(statusMessages[action.status]);
        return true;
      }),
      catchError(error => {
        console.error('Failed to moderate comment:', error);
        NotificationHelper.showError('Yorum işlenemedi');
        return of(false);
      })
    );
  }

  /**
   * Bulk moderate comments
   */
  bulkModerate(ids: number[], action: ModerationAction): Observable<boolean> {
    return this.http.post(API_ENDPOINTS.comments.bulkModerate, {
      ids,
      status: action.status,
      note: action.note,
    }).pipe(
      map(() => {
        NotificationHelper.showSuccess(`${ids.length} yorum işlendi`);
        return true;
      }),
      catchError(error => {
        console.error('Failed to bulk moderate:', error);
        NotificationHelper.showError('Yorumlar işlenemedi');
        return of(false);
      })
    );
  }

  /**
   * Delete comment
   */
  deleteComment(id: number): Observable<boolean> {
    return this.http.delete(API_ENDPOINTS.comments.detail(id)).pipe(
      map(() => {
        NotificationHelper.showSuccess('Yorum silindi');
        return true;
      }),
      catchError(error => {
        console.error('Failed to delete comment:', error);
        NotificationHelper.showError('Yorum silinemedi');
        return of(false);
      })
    );
  }

  /**
   * Refresh comments list
   */
  refresh(): void {
    this.loadComments();
  }
}
