import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { WebSocketService } from './websocket.service';
import { environment } from '../../../environments/environment';
import { BreakingNewsWebSocketMessage } from '../../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class BreakingNewsWebSocketService {
  private wsService = inject(WebSocketService);

  /**
   * Connect to breaking news WebSocket (no auth required)
   */
  connect(): void {
    const wsUrl = `${environment.wsUrl}/breaking-news/`;
    this.wsService.connect(wsUrl);
  }

  /**
   * Disconnect from breaking news WebSocket
   */
  disconnect(): void {
    this.wsService.disconnect();
  }

  /**
   * Get breaking news stream
   */
  getBreakingNews(): Observable<BreakingNewsWebSocketMessage> {
    return this.wsService.messages$.pipe(
      filter((message: BreakingNewsWebSocketMessage) =>
        message.type === 'breaking_news'
      )
    );
  }
}
