/**
 * Stats Card Component (Dumb)
 *
 * Reusable stat display card with trend indicator
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NumberUtils } from '../../../../shared/utils/number.utils';

type StatColor = 'blue' | 'green' | 'purple' | 'orange' | 'red';
type StatIcon = 'document-text' | 'users' | 'chat-bubble' | 'eye' | 'chart-bar';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  template: `
    <div [class]="getCardClasses()">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-600">{{ title }}</p>
          <p class="mt-2 text-3xl font-bold text-gray-900">
            {{ formattedValue }}
          </p>

          @if (trend !== undefined && trend !== 0) {
            <div [class]="getTrendClasses()" class="mt-2 flex items-center text-sm">
              @if (trend > 0) {
                <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              } @else {
                <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              }
              <span>{{ Math.abs(trend) }}%</span>
              <span class="ml-1 text-gray-500">geçen aya göre</span>
            </div>
          }
        </div>

        <div [class]="getIconContainerClasses()">
          @switch (icon) {
            @case ('document-text') {
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            @case ('users') {
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            @case ('chat-bubble') {
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
            @case ('eye') {
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            @case ('chart-bar') {
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          }
        </div>
      </div>

      @if (link) {
        <a
          [routerLink]="link"
          class="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Detayları Gör
          <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      }
    </div>
  `,
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() value: number = 0;
  @Input() trend?: number;
  @Input() icon: StatIcon = 'chart-bar';
  @Input() color: StatColor = 'blue';
  @Input() link?: string;

  protected readonly Math = Math;

  get formattedValue(): string {
    return NumberUtils.abbreviate(this.value);
  }

  getCardClasses(): string {
    return 'rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg';
  }

  getIconContainerClasses(): string {
    const colorMap: Record<StatColor, string> = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
    };

    return `flex h-12 w-12 items-center justify-center rounded-lg ${colorMap[this.color]}`;
  }

  getTrendClasses(): string {
    if (this.trend === undefined || this.trend === 0) return '';
    return this.trend > 0 ? 'text-green-600' : 'text-red-600';
  }
}
