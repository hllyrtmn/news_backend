import { Injectable } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { retryWhen, tap, delayWhen } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private ws$: WebSocketSubject<any> | null = null;
  private messagesSubject$ = new Subject<any>();
  public messages$ = this.messagesSubject$.asObservable();

  private reconnectAttempts = 0;
  private maxReconnectAttempts = environment.wsMaxRetries;
  private reconnectInterval = environment.wsReconnectInterval;

  /**
   * Connect to WebSocket
   */
  connect(url: string, token?: string): void {
    if (this.ws$) {
      return; // Already connected
    }

    // Build WebSocket URL with token if provided
    let wsUrl = url;
    if (token) {
      wsUrl += `?token=${token}`;
    }

    this.ws$ = webSocket({
      url: wsUrl,
      openObserver: {
        next: () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
        }
      },
      closeObserver: {
        next: () => {
          console.log('WebSocket closed');
          this.ws$ = null;
        }
      }
    });

    // Subscribe to messages
    this.ws$
      .pipe(
        retryWhen(errors =>
          errors.pipe(
            tap(err => {
              console.error('WebSocket error:', err);
              this.reconnectAttempts++;
            }),
            delayWhen(() => {
              if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                throw new Error('Max reconnection attempts reached');
              }
              return timer(this.reconnectInterval);
            })
          )
        )
      )
      .subscribe({
        next: (message) => this.messagesSubject$.next(message),
        error: (err) => console.error('WebSocket error:', err),
        complete: () => console.log('WebSocket connection closed')
      });
  }

  /**
   * Send message through WebSocket
   */
  sendMessage(message: any): void {
    if (this.ws$) {
      this.ws$.next(message);
    } else {
      console.error('WebSocket is not connected');
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws$) {
      this.ws$.complete();
      this.ws$ = null;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws$ !== null;
  }
}
