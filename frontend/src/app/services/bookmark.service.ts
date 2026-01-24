import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/api/api.service';
import { Bookmark, ReadingList } from '../models/api-response.model';
import { Article } from '../models/article.model';
import { ApiSuccess } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  private api = inject(ApiService);

  /**
   * Get user's bookmarks (requires authentication)
   */
  getBookmarks(): Observable<Bookmark[]> {
    return this.api.get<Bookmark[]>('bookmarks/');
  }

  /**
   * Add bookmark
   */
  addBookmark(articleId: number): Observable<Bookmark> {
    return this.api.post<Bookmark>('bookmarks/', { article: articleId });
  }

  /**
   * Remove bookmark
   */
  removeBookmark(id: number): Observable<void> {
    return this.api.delete<void>(`bookmarks/${id}/`);
  }

  /**
   * Check if article is bookmarked
   */
  isBookmarked(articleId: number): Observable<{ bookmarked: boolean; bookmark_id?: number }> {
    return this.api.get<{ bookmarked: boolean; bookmark_id?: number }>(`bookmarks/check/${articleId}/`);
  }

  /**
   * Get reading lists
   */
  getReadingLists(): Observable<ReadingList[]> {
    return this.api.get<ReadingList[]>('reading-lists/');
  }

  /**
   * Create reading list
   */
  createReadingList(data: {
    name: string;
    description?: string;
    is_public?: boolean;
  }): Observable<ReadingList> {
    return this.api.post<ReadingList>('reading-lists/', data);
  }

  /**
   * Update reading list
   */
  updateReadingList(id: number, data: Partial<ReadingList>): Observable<ReadingList> {
    return this.api.patch<ReadingList>(`reading-lists/${id}/`, data);
  }

  /**
   * Delete reading list
   */
  deleteReadingList(id: number): Observable<void> {
    return this.api.delete<void>(`reading-lists/${id}/`);
  }

  /**
   * Add article to reading list
   */
  addToReadingList(listId: number, articleId: number): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`reading-lists/${listId}/add_article/`, { article_id: articleId });
  }

  /**
   * Remove article from reading list
   */
  removeFromReadingList(listId: number, articleId: number): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`reading-lists/${listId}/remove_article/`, { article_id: articleId });
  }

  /**
   * Get articles in reading list
   */
  getReadingListArticles(listId: number): Observable<Article[]> {
    return this.api.get<Article[]>(`reading-lists/${listId}/articles/`);
  }
}
