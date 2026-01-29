/**
 * Dashboard Component (Smart)
 *
 * Main admin dashboard with stats, charts, and recent activity
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Services
import { DashboardService } from './services/dashboard.service';

// Components
import { StatsCardComponent } from './components/stats-card/stats-card.component';
import { RecentActivityComponent } from './components/recent-activity/recent-activity.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

// Types
import { DashboardStats, RecentActivity } from './types/dashboard.types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    StatsCardComponent,
    RecentActivityComponent,
    QuickActionsComponent,
    SpinnerComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p class="mt-1 text-sm text-gray-500">
            Admin paneline hoş geldiniz
          </p>
        </div>
        <div class="text-sm text-gray-500">
          Son güncelleme: {{ lastUpdated() | date: 'dd.MM.yyyy HH:mm' }}
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <app-spinner size="lg"></app-spinner>
        </div>
      } @else {
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <app-stats-card
            title="Toplam Makale"
            [value]="stats()?.totalArticles ?? 0"
            [trend]="stats()?.articlesTrend ?? 0"
            icon="document-text"
            color="blue"
            [link]="'/admin/articles'"
          />
          <app-stats-card
            title="Toplam Kullanıcı"
            [value]="stats()?.totalUsers ?? 0"
            [trend]="stats()?.usersTrend ?? 0"
            icon="users"
            color="green"
            [link]="'/admin/users'"
          />
          <app-stats-card
            title="Toplam Yorum"
            [value]="stats()?.totalComments ?? 0"
            [trend]="stats()?.commentsTrend ?? 0"
            icon="chat-bubble"
            color="purple"
            [link]="'/admin/comments'"
          />
          <app-stats-card
            title="Toplam Görüntülenme"
            [value]="stats()?.totalViews ?? 0"
            [trend]="stats()?.viewsTrend ?? 0"
            icon="eye"
            color="orange"
            [link]="'/admin/analytics'"
          />
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Recent Activity (2/3 width) -->
          <div class="lg:col-span-2">
            <app-recent-activity
              [activities]="recentActivities()"
              [loading]="activitiesLoading()"
            />
          </div>

          <!-- Quick Actions (1/3 width) -->
          <div>
            <app-quick-actions />
          </div>
        </div>

        <!-- Popular Articles Section -->
        <div class="rounded-lg bg-white p-6 shadow">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Popüler Makaleler</h2>
            <a
              routerLink="/admin/articles"
              class="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Tümünü Gör
            </a>
          </div>

          @if (popularArticles().length === 0) {
            <p class="py-8 text-center text-gray-500">Henüz makale bulunmuyor</p>
          } @else {
            <div class="space-y-4">
              @for (article of popularArticles(); track article.id) {
                <div class="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-900">{{ article.title }}</h3>
                    <p class="mt-1 text-sm text-gray-500">
                      {{ article.author }} • {{ article.publishedAt | date: 'dd.MM.yyyy' }}
                    </p>
                  </div>
                  <div class="ml-4 flex items-center space-x-6 text-sm text-gray-500">
                    <div class="flex items-center">
                      <svg class="mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {{ article.views }}
                    </div>
                    <div class="flex items-center">
                      <svg class="mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {{ article.comments }}
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  // Signals for state
  stats = signal<DashboardStats | null>(null);
  recentActivities = signal<RecentActivity[]>([]);
  popularArticles = signal<any[]>([]);
  loading = signal(true);
  activitiesLoading = signal(false);
  lastUpdated = signal(new Date());

  constructor() {
    // Subscribe to service signals
    this.dashboardService.stats$.pipe(takeUntilDestroyed()).subscribe(stats => {
      this.stats.set(stats);
      this.loading.set(false);
    });

    this.dashboardService.recentActivities$.pipe(takeUntilDestroyed()).subscribe(activities => {
      this.recentActivities.set(activities);
      this.activitiesLoading.set(false);
    });

    this.dashboardService.popularArticles$.pipe(takeUntilDestroyed()).subscribe(articles => {
      this.popularArticles.set(articles);
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    this.activitiesLoading.set(true);

    this.dashboardService.loadStats();
    this.dashboardService.loadRecentActivities();
    this.dashboardService.loadPopularArticles();

    this.lastUpdated.set(new Date());
  }
}
