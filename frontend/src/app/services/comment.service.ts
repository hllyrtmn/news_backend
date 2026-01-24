import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/api/api.service';
import { Comment, CommentCreateRequest } from '../models/comment.model';
import { PaginatedResponse, ApiSuccess } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private api = inject(ApiService);

  /**
   * Get comments for an article
   */
  getArticleComments(articleSlug: string, params?: {
    page?: number;
    limit?: number;
    ordering?: string;
  }): Observable<PaginatedResponse<Comment>> {
    return this.api.get<PaginatedResponse<Comment>>(`articles/${articleSlug}/comments/`, params);
  }

  /**
   * Get single comment
   */
  getComment(id: number): Observable<Comment> {
    return this.api.get<Comment>(`comments/${id}/`);
  }

  /**
   * Create new comment (requires authentication)
   */
  createComment(data: CommentCreateRequest): Observable<Comment> {
    return this.api.post<Comment>('comments/', data);
  }

  /**
   * Update comment (requires authentication)
   */
  updateComment(id: number, data: Partial<CommentCreateRequest>): Observable<Comment> {
    return this.api.patch<Comment>(`comments/${id}/`, data);
  }

  /**
   * Delete comment (requires authentication)
   */
  deleteComment(id: number): Observable<void> {
    return this.api.delete<void>(`comments/${id}/`);
  }

  /**
   * Like a comment
   */
  likeComment(id: number): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`comments/${id}/like/`, {});
  }

  /**
   * Unlike a comment
   */
  unlikeComment(id: number): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`comments/${id}/unlike/`, {});
  }

  /**
   * Report a comment
   */
  reportComment(id: number, reason: string): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`comments/${id}/report/`, { reason });
  }

  /**
   * Get user's comments (requires authentication)
   */
  getMyComments(params?: {
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<Comment>> {
    return this.api.get<PaginatedResponse<Comment>>('comments/my_comments/', params);
  }

  /**
   * Get moderation queue (admin only)
   */
  getModerationQueue(params?: {
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<Comment>> {
    return this.api.get<PaginatedResponse<Comment>>('comments/moderation_queue/', params);
  }

  /**
   * Approve comment (admin only)
   */
  approveComment(id: number): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`comments/${id}/approve/`, {});
  }

  /**
   * Reject comment (admin only)
   */
  rejectComment(id: number): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`comments/${id}/reject/`, {});
  }

  /**
   * Mark comment as spam (admin only)
   */
  markAsSpam(id: number): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`comments/${id}/mark_as_spam/`, {});
  }
}
