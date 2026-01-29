/**
 * Recent Activity Component (Dumb)
 *
 * Displays list of recent activities
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DateAgoPipe } from '../../../../shared/pipes/date-ago.pipe';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { RecentActivity, ActivityType } from '../../types/dashboard.types';

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    DateAgoPipe,
    SpinnerComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="rounded-lg bg-white p-6 shadow">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">Son Aktiviteler</h2>

      @if (loading) {
        <div class="flex justify-center py-8">
          <app-spinner size="md"></app-spinner>
        </div>
      } @else if (activities.length === 0) {
        <app-empty-state
          icon="clock"
          message="Henüz aktivite bulunmuyor"
        />
      } @else {
        <div class="flow-root">
          <ul role="list" class="-mb-8">
            @for (activity of activities; track activity.id; let last = $last) {
              <li>
                <div class="relative pb-8">
                  @if (!last) {
                    <span
                      class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    ></span>
                  }
                  <div class="relative flex space-x-3">
                    <!-- Icon -->
                    <div>
                      <span [class]="getActivityIconClasses(activity.type)">
                        @switch (getActivityIcon(activity.type)) {
                          @case ('document') {
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                            </svg>
                          }
                          @case ('comment') {
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                            </svg>
                          }
                          @case ('user') {
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                          }
                          @case ('tag') {
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                            </svg>
                          }
                          @case ('category') {
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                            </svg>
                          }
                        }
                      </span>
                    </div>

                    <!-- Content -->
                    <div class="flex min-w-0 flex-1 justify-between space-x-4">
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">
                          {{ activity.title }}
                        </p>
                        <p class="mt-0.5 text-sm text-gray-500">
                          {{ activity.description }}
                        </p>
                        <div class="mt-1 text-xs text-gray-400">
                          <span>{{ activity.user.name }}</span>
                          <span class="mx-1">•</span>
                          <span>{{ activity.timestamp | dateAgo }}</span>
                        </div>
                      </div>

                      @if (activity.link) {
                        <div class="flex-shrink-0">
                          <a
                            [routerLink]="activity.link"
                            class="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            Görüntüle
                          </a>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
})
export class RecentActivityComponent {
  @Input() activities: RecentActivity[] = [];
  @Input() loading: boolean = false;

  getActivityIcon(type: ActivityType): 'document' | 'comment' | 'user' | 'tag' | 'category' {
    const iconMap: Record<ActivityType, 'document' | 'comment' | 'user' | 'tag' | 'category'> = {
      article_created: 'document',
      article_published: 'document',
      article_updated: 'document',
      comment_created: 'comment',
      comment_approved: 'comment',
      comment_rejected: 'comment',
      user_registered: 'user',
      user_updated: 'user',
      category_created: 'category',
      tag_created: 'tag',
    };
    return iconMap[type];
  }

  getActivityIconClasses(type: ActivityType): string {
    const baseClasses = 'flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white';

    const colorMap: Record<ActivityType, string> = {
      article_created: 'bg-blue-500 text-white',
      article_published: 'bg-green-500 text-white',
      article_updated: 'bg-yellow-500 text-white',
      comment_created: 'bg-purple-500 text-white',
      comment_approved: 'bg-green-500 text-white',
      comment_rejected: 'bg-red-500 text-white',
      user_registered: 'bg-blue-500 text-white',
      user_updated: 'bg-yellow-500 text-white',
      category_created: 'bg-indigo-500 text-white',
      tag_created: 'bg-pink-500 text-white',
    };

    return `${baseClasses} ${colorMap[type]}`;
  }
}
