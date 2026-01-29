/**
 * Sidebar Component (Smart)
 *
 * Main navigation sidebar with menu items and collapse functionality
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
import { ADMIN_ROUTES } from '../../constants/routes.constants';
import { StorageHelper } from '../../helpers/storage.helper';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  template: `
    <aside
      [class]="sidebarClasses()"
      class="fixed left-0 top-0 z-30 h-screen bg-gray-900 text-white transition-all duration-300"
    >
      <!-- Logo -->
      <div class="flex h-16 items-center justify-between border-b border-gray-800 px-4">
        @if (!isCollapsed()) {
          <h1 class="text-xl font-bold">Haber Admin</h1>
        } @else {
          <span class="text-xl font-bold">HA</span>
        }
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4">
        @for (item of menuItems(); track item.route) {
          @if (item.children && item.children.length > 0) {
            <!-- Menu with submenu -->
            <div class="mb-1">
              <button
                (click)="toggleSubmenu(item.route)"
                [class]="getMenuItemClasses(item.route)"
                class="w-full"
              >
                <span [innerHTML]="getIcon(item.icon)"></span>
                @if (!isCollapsed()) {
                  <span class="flex-1 text-left">{{ item.label }}</span>
                  <svg
                    class="h-4 w-4 transition-transform"
                    [class.rotate-180]="isSubmenuOpen(item.route)"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                }
              </button>
              @if (isSubmenuOpen(item.route) && !isCollapsed()) {
                <div class="ml-12 space-y-1">
                  @for (child of item.children; track child.route) {
                    <a
                      [routerLink]="child.route"
                      routerLinkActive="bg-blue-600"
                      class="block rounded px-3 py-2 text-sm hover:bg-gray-800 transition-colors"
                    >
                      {{ child.label }}
                    </a>
                  }
                </div>
              }
            </div>
          } @else {
            <!-- Regular menu item -->
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-blue-600"
              [class]="getMenuItemClasses(item.route)"
              [title]="isCollapsed() ? item.label : ''"
            >
              <span [innerHTML]="getIcon(item.icon)"></span>
              @if (!isCollapsed()) {
                <span class="flex-1">{{ item.label }}</span>
                @if (item.badge) {
                  <span class="rounded-full bg-red-500 px-2 py-0.5 text-xs">
                    {{ item.badge }}
                  </span>
                }
              }
            </a>
          }
        }
      </nav>

      <!-- Toggle Button -->
      <div class="border-t border-gray-800 p-4">
        <button
          (click)="toggleSidebar()"
          class="flex w-full items-center justify-center rounded-lg bg-gray-800 p-2 hover:bg-gray-700 transition-colors"
          [title]="isCollapsed() ? 'Menüyü Genişlet' : 'Menüyü Daralt'"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            @if (isCollapsed()) {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            } @else {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            }
          </svg>
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent implements OnInit {
  private readonly STORAGE_KEY = 'sidebar_collapsed';

  // Signals
  isCollapsed = signal<boolean>(false);
  openSubmenus = signal<Set<string>>(new Set());

  // Computed
  sidebarClasses = computed(() => {
    return this.isCollapsed() ? 'w-16' : 'w-64';
  });

  menuItems = signal<MenuItem[]>([
    {
      label: 'Dashboard',
      icon: 'chart',
      route: ADMIN_ROUTES.dashboard,
    },
    {
      label: 'İçerik',
      icon: 'document',
      route: '/admin/content',
      children: [
        { label: 'Makaleler', icon: '', route: ADMIN_ROUTES.articles.list },
        { label: 'Kategoriler', icon: '', route: ADMIN_ROUTES.categories.list },
        { label: 'Etiketler', icon: '', route: ADMIN_ROUTES.tags.list },
      ],
    },
    {
      label: 'Medya',
      icon: 'photo',
      route: ADMIN_ROUTES.media.library,
    },
    {
      label: 'Kullanıcılar',
      icon: 'users',
      route: ADMIN_ROUTES.users.list,
    },
    {
      label: 'Yorumlar',
      icon: 'chat',
      route: ADMIN_ROUTES.comments.list,
      badge: 5, // This would come from a service in real implementation
    },
    {
      label: 'Analitik',
      icon: 'analytics',
      route: ADMIN_ROUTES.analytics.dashboard,
    },
    {
      label: 'Ayarlar',
      icon: 'settings',
      route: '/admin/settings',
      children: [
        { label: 'Genel', icon: '', route: ADMIN_ROUTES.settings.general },
        { label: 'SEO', icon: '', route: ADMIN_ROUTES.settings.seo },
        { label: 'Sosyal Medya', icon: '', route: ADMIN_ROUTES.settings.social },
        { label: 'Bildirimler', icon: '', route: ADMIN_ROUTES.settings.notifications },
      ],
    },
  ]);

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Load collapsed state from storage
    const savedState = StorageHelper.get<boolean>(this.STORAGE_KEY);
    if (savedState !== null) {
      this.isCollapsed.set(savedState);
    }
  }

  toggleSidebar(): void {
    const newState = !this.isCollapsed();
    this.isCollapsed.set(newState);
    StorageHelper.set(this.STORAGE_KEY, newState);

    // Close all submenus when collapsing
    if (newState) {
      this.openSubmenus.set(new Set());
    }
  }

  toggleSubmenu(route: string): void {
    const submenus = new Set(this.openSubmenus());
    if (submenus.has(route)) {
      submenus.delete(route);
    } else {
      submenus.add(route);
    }
    this.openSubmenus.set(submenus);
  }

  isSubmenuOpen(route: string): boolean {
    return this.openSubmenus().has(route);
  }

  getMenuItemClasses(route: string): string {
    return 'flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-gray-800 transition-colors mb-1';
  }

  getIcon(icon: string): string {
    const icons: Record<string, string> = {
      chart: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>',
      document: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>',
      photo: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>',
      users: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>',
      chat: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>',
      analytics: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>',
      settings: '<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
    };
    return icons[icon] || '';
  }
}
