import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/api/api.service';
import { SearchResponse, SearchAutocompleteResponse, SearchSuggestionsResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private api = inject(ApiService);

  /**
   * Global search (articles, authors, categories, tags)
   */
  search(query: string, params?: {
    type?: 'all' | 'articles' | 'authors' | 'categories' | 'tags';
    limit?: number;
  }): Observable<SearchResponse> {
    return this.api.get<SearchResponse>('core/search/', { q: query, ...params });
  }

  /**
   * Search autocomplete suggestions
   */
  autocomplete(query: string, limit: number = 10): Observable<SearchAutocompleteResponse> {
    return this.api.get<SearchAutocompleteResponse>('core/search/autocomplete/', { q: query, limit });
  }

  /**
   * Get search suggestions (trending topics, popular searches)
   */
  getSuggestions(): Observable<SearchSuggestionsResponse> {
    return this.api.get<SearchSuggestionsResponse>('core/search/suggestions/');
  }
}
