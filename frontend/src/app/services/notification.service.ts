import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/api/api.service';
import { Notification, NotificationPreferences } from '../models/notification.model';
import { PaginatedResponse, ApiSuccess } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private api = inject(ApiService);

  /**
   * Get user's notifications (requires authentication)
   */
  getNotifications(params?: {
    page?: number;
    limit?: number;
    is_read?: boolean;
    type?: string;
  }): Observable<PaginatedResponse<Notification>> {
    return this.api.get<PaginatedResponse<Notification>>('notifications/', params);
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): Observable<{ count: number }> {
    return this.api.get<{ count: number }>('notifications/unread_count/');
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: number): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>(`notifications/${id}/mark_as_read/`, {});
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<ApiSuccess> {
    return this.api.post<ApiSuccess>('notifications/mark_all_as_read/', {});
  }

  /**
   * Delete notification
   */
  deleteNotification(id: number): Observable<void> {
    return this.api.delete<void>(`notifications/${id}/`);
  }

  /**
   * Get notification preferences
   */
  getPreferences(): Observable<NotificationPreferences> {
    return this.api.get<NotificationPreferences>('notifications/preferences/');
  }

  /**
   * Update notification preferences
   */
  updatePreferences(data: Partial<NotificationPreferences>): Observable<NotificationPreferences> {
    return this.api.patch<NotificationPreferences>('notifications/preferences/', data);
  }
}
