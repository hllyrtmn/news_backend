/**
 * Quick Actions Component (Dumb)
 *
 * Quick action buttons for common tasks
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ADMIN_ROUTES } from '../../../../shared/constants/routes.constants';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="rounded-lg bg-white p-6 shadow">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">Hızlı İşlemler</h2>

      <div class="space-y-3">
        @for (action of actions; track action.id) {
          <a
            [routerLink]="action.link"
            [class]="getActionClasses(action.color)"
          >
            <div class="flex items-center">
              <div [class]="getIconClasses(action.color)">
                @switch (action.icon) {
                  @case ('plus-document') {
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                  @case ('plus-user') {
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  }
                  @case ('plus-folder') {
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  }
                  @case ('upload') {
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  }
                  @case ('chat-alt') {
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  }
                  @case ('chart-bar') {
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                }
              </div>

              <div class="ml-4 flex-1">
                <p class="text-sm font-medium text-gray-900">{{ action.title }}</p>
                <p class="mt-0.5 text-xs text-gray-500">{{ action.description }}</p>
              </div>

              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        }
      </div>
    </div>
  `,
})
export class QuickActionsComponent {
  protected readonly actions: QuickAction[] = [
    {
      id: 'new-article',
      title: 'Yeni Makale',
      description: 'Makale oluştur',
      icon: 'plus-document',
      link: `${ADMIN_ROUTES.articles}/new`,
      color: 'blue',
    },
    {
      id: 'new-category',
      title: 'Yeni Kategori',
      description: 'Kategori ekle',
      icon: 'plus-folder',
      link: `${ADMIN_ROUTES.categories}/new`,
      color: 'green',
    },
    {
      id: 'upload-media',
      title: 'Medya Yükle',
      description: 'Dosya yükle',
      icon: 'upload',
      link: `${ADMIN_ROUTES.media}/upload`,
      color: 'purple',
    },
    {
      id: 'pending-comments',
      title: 'Bekleyen Yorumlar',
      description: 'Yorumları yönet',
      icon: 'chat-alt',
      link: `${ADMIN_ROUTES.comments}/pending`,
      color: 'orange',
    },
  ];

  getActionClasses(color: string): string {
    return 'flex items-center rounded-lg border border-gray-200 p-4 transition-all hover:border-gray-300 hover:shadow-md';
  }

  getIconClasses(color: 'blue' | 'green' | 'purple' | 'orange'): string {
    const colorMap: Record<typeof color, string> = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
    };

    return `flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${colorMap[color]}`;
  }
}
