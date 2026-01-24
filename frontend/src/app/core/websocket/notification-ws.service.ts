import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { WebSocketService } from './websocket.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';
import { NotificationWebSocketMessage } from '../../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationWebSocketService {
  private wsService = inject(WebSocketService);
  private authService = inject(AuthService);

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  // Expose WebSocket messages
  public get messages$(): Observable<NotificationWebSocketMessage> {
    return this.wsService.messages$ as Observable<NotificationWebSocketMessage>;
  }

  /**
   * Connect to notification WebSocket
   */
  connect(): void {
    const token = this.authService.getAccessToken();

    if (!token) {
      console.error('Cannot connect to notification WebSocket: No auth token');
      return;
    }

    const wsUrl = `${environment.wsUrl}/notifications/`;
    this.wsService.connect(wsUrl, token);

    // Listen to messages
    this.wsService.messages$.subscribe({
      next: (message: NotificationWebSocketMessage) => {
        this.handleMessage(message);
      },
      error: (err) => {
        console.error('Notification WebSocket error:', err);
        this.connectedSubject.next(false);
      }
    });
  }

  /**
   * Disconnect from notification WebSocket
   */
  disconnect(): void {
    this.wsService.disconnect();
    this.connectedSubject.next(false);
  }

  /**
   * Get notification stream
   */
  getNotifications(): Observable<NotificationWebSocketMessage> {
    return this.wsService.messages$.pipe(
      filter((message: NotificationWebSocketMessage) =>
        message.type === 'notification'
      )
    );
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: number): void {
    this.wsService.sendMessage({
      type: 'mark_as_read',
      notification_id: notificationId
    });
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.wsService.sendMessage({
      type: 'mark_all_as_read'
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(message: NotificationWebSocketMessage): void {
    switch (message.type) {
      case 'connection_established':
        console.log('Connected to notification stream');
        this.connectedSubject.next(true);
        break;

      case 'unread_count':
        if (message.count !== undefined) {
          this.unreadCountSubject.next(message.count);
        }
        break;

      case 'notification':
        // New notification received
        // Increment unread count
        this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
        break;

      case 'notification_read':
      case 'all_notifications_read':
        // Notification(s) marked as read
        if (message.type === 'all_notifications_read') {
          this.unreadCountSubject.next(0);
        } else {
          this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
        }
        break;

      case 'error':
        console.error('Notification WebSocket error:', message.message);
        break;
    }
  }
}
