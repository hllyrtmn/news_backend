/**
 * Loading Spinner Component (Dumb)
 *
 * Reusable loading indicator with different sizes
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses" role="status" aria-label="Yükleniyor">
      <svg
        [class]="spinnerClasses"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      @if (text) {
        <span class="ml-2 text-sm text-gray-600">{{ text }}</span>
      }
    </div>
  `,
})
export class SpinnerComponent {
  @Input() size: SpinnerSize = 'md';
  @Input() text: string = '';
  @Input() centered: boolean = false;

  get containerClasses(): string {
    const base = 'flex items-center';
    return this.centered ? `${base} justify-center` : base;
  }

  get spinnerClasses(): string {
    const baseClasses = 'animate-spin text-blue-600';

    const sizeClasses: Record<SpinnerSize, string> = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    };

    return `${baseClasses} ${sizeClasses[this.size]}`;
  }
}
