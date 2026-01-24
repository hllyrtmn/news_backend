import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/api/api.service';
import { NewsletterSubscription } from '../models/api-response.model';
import { ApiSuccess } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private api = inject(ApiService);

  /**
   * Subscribe to newsletter
   */
  subscribe(email: string): Observable<NewsletterSubscription> {
    return this.api.post<NewsletterSubscription>('newsletter/subscribe/', { email });
  }

  /**
   * Unsubscribe from newsletter
   */
  unsubscribe(email: string): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>('newsletter/unsubscribe/', { email });
  }

  /**
   * Check subscription status
   */
  checkSubscription(email: string): Observable<{ subscribed: boolean }> {
    return this.api.get<{ subscribed: boolean }>('newsletter/check/', { email });
  }
}
