import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/api/api.service';
import { Tag } from '../models/tag.model';
import { Article } from '../models/article.model';
import { PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private api = inject(ApiService);

  /**
   * Get all tags
   */
  getTags(params?: { limit?: number }): Observable<Tag[]> {
    return this.api.get<Tag[]>('tags/', params);
  }

  /**
   * Get single tag by slug
   */
  getTag(slug: string): Observable<Tag> {
    return this.api.get<Tag>(`tags/${slug}/`);
  }

  /**
   * Get articles with a tag
   */
  getTagArticles(slug: string, params?: {
    page?: number;
    limit?: number;
    ordering?: string;
  }): Observable<PaginatedResponse<Article>> {
    return this.api.get<PaginatedResponse<Article>>(`tags/${slug}/articles/`, params);
  }

  /**
   * Get trending tags (by usage count)
   */
  getTrendingTags(limit: number = 20): Observable<Tag[]> {
    return this.api.get<Tag[]>('tags/trending/', { limit });
  }
}
