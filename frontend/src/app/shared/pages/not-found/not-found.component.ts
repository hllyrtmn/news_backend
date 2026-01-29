/**
 * Not Found (404) Component
 *
 * Displayed when user navigates to non-existent route
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ADMIN_ROUTES } from '../../constants/routes.constants';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div class="text-center">
        <!-- 404 Icon -->
        <div class="mb-8">
          <svg
            class="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <!-- Error Message -->
        <h1 class="mb-4 text-6xl font-bold text-gray-900">404</h1>
        <h2 class="mb-2 text-2xl font-semibold text-gray-800">Sayfa Bulunamadı</h2>
        <p class="mb-8 text-gray-600">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>

        <!-- Actions -->
        <div class="flex items-center justify-center gap-4">
          <button
            (click)="goBack()"
            class="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Geri Dön
          </button>
          <a
            [routerLink]="dashboardRoute"
            class="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Ana Sayfaya Git
          </a>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {
  dashboardRoute = ADMIN_ROUTES.dashboard;

  goBack(): void {
    window.history.back();
  }
}
