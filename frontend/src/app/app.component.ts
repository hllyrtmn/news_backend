import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { NotificationWebSocketService } from './core/websocket/notification-ws.service';
import { BreakingNewsWebSocketService } from './core/websocket/breaking-news-ws.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private notificationWs = inject(NotificationWebSocketService);
  private breakingNewsWs = inject(BreakingNewsWebSocketService);

  ngOnInit(): void {
    // Initialize auth state
    this.authService.loadUserFromStorage();

    // Connect to WebSocket services if authenticated
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Connect to notification WebSocket (requires auth)
        this.notificationWs.connect();

        // Listen for notifications
        this.notificationWs.messages$.subscribe(message => {
          if (message.type === 'notification') {
            console.log('New notification:', message.notification);
            // You can show a toast notification here
          }
        });

        // Get unread count
        this.notificationWs.unreadCount$.subscribe(count => {
          console.log('Unread notifications:', count);
        });
      } else {
        // Disconnect from notification WebSocket when logged out
        this.notificationWs.disconnect();
      }
    });

    // Always connect to breaking news WebSocket (public)
    this.breakingNewsWs.connect();

    // Listen for breaking news
    this.breakingNewsWs.messages$.subscribe(message => {
      if (message.type === 'breaking_news') {
        console.log('Breaking news:', message.article);
        // You can show a prominent notification banner here
      }
    });
  }
}
