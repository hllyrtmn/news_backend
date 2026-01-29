/**
 * Card Component (Dumb)
 *
 * Reusable card container with header, body, footer slots
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      @if (hasHeader) {
        <div class="px-6 py-4 border-b border-gray-200">
          <ng-content select="[header]"></ng-content>
        </div>
      }

      <div [class]="bodyClasses">
        <ng-content></ng-content>
      </div>

      @if (hasFooter) {
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <ng-content select="[footer]"></ng-content>
        </div>
      }
    </div>
  `,
})
export class CardComponent {
  @Input() noPadding: boolean = false;
  @Input() shadow: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() hasHeader: boolean = false;
  @Input() hasFooter: boolean = false;

  get cardClasses(): string {
    const baseClasses = 'bg-white rounded-lg border border-gray-200 overflow-hidden';

    const shadowClasses: Record<typeof this.shadow, string> = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    };

    return `${baseClasses} ${shadowClasses[this.shadow]}`;
  }

  get bodyClasses(): string {
    return this.noPadding ? '' : 'p-6';
  }
}
