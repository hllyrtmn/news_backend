/**
 * Notification Helper Functions
 *
 * Helper functions for showing user notifications/toasts
 * Note: This is a simple implementation. In production, use a toast library like ngx-toastr
 */

export interface NotificationOptions {
  duration?: number; // milliseconds
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  closeable?: boolean;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export class NotificationHelper {
  private static container: HTMLElement | null = null;
  private static defaultDuration = 3000; // 3 seconds

  /**
   * Initialize notification container
   */
  private static initContainer(position: string = 'top-right'): void {
    if (this.container) {
      return;
    }

    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.style.cssText = `
      position: fixed;
      z-index: 9999;
      ${this.getPositionStyles(position)}
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 20px;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  /**
   * Get position styles
   */
  private static getPositionStyles(position: string): string {
    const positions: Record<string, string> = {
      'top-right': 'top: 0; right: 0;',
      'top-left': 'top: 0; left: 0;',
      'bottom-right': 'bottom: 0; right: 0;',
      'bottom-left': 'bottom: 0; left: 0;',
      'top-center': 'top: 0; left: 50%; transform: translateX(-50%);',
      'bottom-center': 'bottom: 0; left: 50%; transform: translateX(-50%);'
    };
    return positions[position] || positions['top-right'];
  }

  /**
   * Show notification
   */
  private static show(
    message: string,
    type: NotificationType,
    options: NotificationOptions = {}
  ): void {
    const {
      duration = this.defaultDuration,
      position = 'top-right',
      closeable = true
    } = options;

    this.initContainer(position);

    const notification = document.createElement('div');
    notification.style.cssText = `
      padding: 12px 16px;
      border-radius: 4px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 300px;
      max-width: 500px;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
      ${this.getTypeStyles(type)}
    `;

    // Icon
    const icon = document.createElement('span');
    icon.innerHTML = this.getIcon(type);
    icon.style.cssText = 'flex-shrink: 0;';

    // Message
    const messageEl = document.createElement('span');
    messageEl.textContent = message;
    messageEl.style.cssText = 'flex: 1; color: #333; font-size: 14px;';

    // Close button
    const closeBtn = document.createElement('button');
    if (closeable) {
      closeBtn.innerHTML = '&times;';
      closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
        padding: 0;
        margin-left: 10px;
        flex-shrink: 0;
      `;
      closeBtn.onclick = () => this.removeNotification(notification);
    }

    notification.appendChild(icon);
    notification.appendChild(messageEl);
    if (closeable) {
      notification.appendChild(closeBtn);
    }

    this.container?.appendChild(notification);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification);
      }, duration);
    }

    // Add animation styles
    this.addAnimationStyles();
  }

  /**
   * Remove notification with animation
   */
  private static removeNotification(notification: HTMLElement): void {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }

  /**
   * Get type-specific styles
   */
  private static getTypeStyles(type: NotificationType): string {
    const styles: Record<NotificationType, string> = {
      success: 'background-color: #d4edda; border-left: 4px solid #28a745;',
      error: 'background-color: #f8d7da; border-left: 4px solid #dc3545;',
      warning: 'background-color: #fff3cd; border-left: 4px solid #ffc107;',
      info: 'background-color: #d1ecf1; border-left: 4px solid #17a2b8;'
    };
    return styles[type];
  }

  /**
   * Get type-specific icon
   */
  private static getIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return `<span style="
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-weight: bold;
      ${this.getIconStyles(type)}
    ">${icons[type]}</span>`;
  }

  /**
   * Get icon-specific styles
   */
  private static getIconStyles(type: NotificationType): string {
    const styles: Record<NotificationType, string> = {
      success: 'background-color: #28a745; color: white;',
      error: 'background-color: #dc3545; color: white;',
      warning: 'background-color: #ffc107; color: #333;',
      info: 'background-color: #17a2b8; color: white;'
    };
    return styles[type];
  }

  /**
   * Add animation styles to document
   */
  private static addAnimationStyles(): void {
    if (document.getElementById('notification-animations')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'notification-animations';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Show success notification
   */
  static showSuccess(message: string, options?: NotificationOptions): void {
    this.show(message, 'success', options);
  }

  /**
   * Show error notification
   */
  static showError(message: string, options?: NotificationOptions): void {
    this.show(message, 'error', { ...options, duration: options?.duration || 5000 });
  }

  /**
   * Show warning notification
   */
  static showWarning(message: string, options?: NotificationOptions): void {
    this.show(message, 'warning', options);
  }

  /**
   * Show info notification
   */
  static showInfo(message: string, options?: NotificationOptions): void {
    this.show(message, 'info', options);
  }

  /**
   * Clear all notifications
   */
  static clearAll(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
