/**
 * Header Component (Smart)
 *
 * Top header with user menu, notifications, and quick search
 */

import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AUTH_ROUTES } from '../../constants/routes.constants';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
}

interface User {
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <!-- Left: Search -->
      <div class="flex items-center gap-4 flex-1">
        <div class="relative w-96">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Ara..."
            class="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <svg
            class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-4">
        <!-- Notifications -->
        <div class="relative">
          <button
            (click)="toggleNotifications()"
            class="relative rounded-lg p-2 hover:bg-gray-100 transition-colors"
            [title]="'Bildirimler'"
          >
            <svg class="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            @if (unreadCount() > 0) {
              <span class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {{ unreadCount() }}
              </span>
            }
          </button>

          <!-- Notifications Dropdown -->
          @if (showNotifications()) {
            <div class="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
              <div class="border-b border-gray-200 px-4 py-3">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-gray-900">Bildirimler</h3>
                  @if (unreadCount() > 0) {
                    <button
                      (click)="markAllAsRead()"
                      class="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Tümünü Okundu İşaretle
                    </button>
                  }
                </div>
              </div>
              <div class="max-h-96 overflow-y-auto">
                @if (notifications().length === 0) {
                  <div class="px-4 py-8 text-center text-gray-500">
                    Bildirim yok
                  </div>
                } @else {
                  @for (notification of notifications(); track notification.id) {
                    <div
                      [class]="notification.read ? 'bg-white' : 'bg-blue-50'"
                      class="border-b border-gray-100 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      (click)="markAsRead(notification.id)"
                    >
                      <div class="flex items-start gap-3">
                        <div [class]="getNotificationIconClasses(notification.type)">
                          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                          <p class="text-xs text-gray-600">{{ notification.message }}</p>
                          <p class="mt-1 text-xs text-gray-400">{{ notification.time }}</p>
                        </div>
                      </div>
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>

        <!-- User Menu -->
        <div class="relative">
          <button
            (click)="toggleUserMenu()"
            class="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 transition-colors"
          >
            @if (currentUser()?.avatar) {
              <img
                [src]="currentUser()?.avatar"
                [alt]="currentUser()?.name"
                class="h-8 w-8 rounded-full object-cover"
              />
            } @else {
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                {{ getUserInitials() }}
              </div>
            }
            <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- User Dropdown -->
          @if (showUserMenu()) {
            <div class="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg">
              <div class="border-b border-gray-200 px-4 py-3">
                <p class="font-medium text-gray-900">{{ currentUser()?.name }}</p>
                <p class="text-sm text-gray-500">{{ currentUser()?.email }}</p>
                <p class="mt-1 text-xs text-gray-400">{{ currentUser()?.role }}</p>
              </div>
              <div class="py-2">
                <a
                  routerLink="/admin/profile"
                  (click)="closeUserMenu()"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profil
                  </div>
                </a>
                <a
                  routerLink="/admin/settings/general"
                  (click)="closeUserMenu()"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Ayarlar
                  </div>
                </a>
              </div>
              <div class="border-t border-gray-200 py-2">
                <button
                  (click)="logout()"
                  class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 transition-colors"
                >
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Çıkış Yap
                  </div>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent implements OnInit {
  // Signals
  searchQuery = '';
  showNotifications = signal<boolean>(false);
  showUserMenu = signal<boolean>(false);
  notifications = signal<Notification[]>([]);
  currentUser = signal<User | null>(null);

  // Computed
  unreadCount = computed(() => {
    return this.notifications().filter(n => !n.read).length;
  });

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Load user data (would come from AuthService in real implementation)
    this.currentUser.set({
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'Administrator',
    });

    // Load notifications (would come from NotificationService in real implementation)
    this.notifications.set([
      {
        id: 1,
        title: 'Yeni yorum',
        message: 'Makalenize yeni bir yorum yapıldı',
        type: 'info',
        time: '5 dakika önce',
        read: false,
      },
      {
        id: 2,
        title: 'Makale onaylandı',
        message: 'Gönderdiğiniz makale onaylandı',
        type: 'success',
        time: '1 saat önce',
        read: false,
      },
      {
        id: 3,
        title: 'Sistem uyarısı',
        message: 'Sistem bakımı 2 saat içinde başlayacak',
        type: 'warning',
        time: '3 saat önce',
        read: true,
      },
    ]);
  }

  onSearch(): void {
    // Implement search logic (would trigger search service)
    console.log('Search:', this.searchQuery);
  }

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
    this.showUserMenu.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
    this.showNotifications.set(false);
  }

  closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  markAsRead(id: number): void {
    this.notifications.update(notifications =>
      notifications.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }

  markAllAsRead(): void {
    this.notifications.update(notifications =>
      notifications.map(n => ({ ...n, read: true }))
    );
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getNotificationIconClasses(type: Notification['type']): string {
    const base = 'flex h-6 w-6 items-center justify-center rounded-full';
    const typeClasses = {
      info: 'bg-blue-100 text-blue-600',
      success: 'bg-green-100 text-green-600',
      warning: 'bg-yellow-100 text-yellow-600',
      error: 'bg-red-100 text-red-600',
    };
    return `${base} ${typeClasses[type]}`;
  }

  logout(): void {
    // Implement logout logic (would call AuthService)
    this.router.navigate([AUTH_ROUTES.login]);
  }
}
