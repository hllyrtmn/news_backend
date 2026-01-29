/**
 * Modal Component (Dumb)
 *
 * Reusable modal dialog with header, body, footer slots
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        (click)="onBackdropClick()"
      ></div>

      <!-- Modal -->
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            [class]="modalClasses"
            role="dialog"
            aria-modal="true"
            [attr.aria-labelledby]="title ? 'modal-title' : null"
          >
            <!-- Header -->
            @if (title || !hideCloseButton) {
              <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                @if (title) {
                  <h2 id="modal-title" class="text-xl font-semibold text-gray-900">
                    {{ title }}
                  </h2>
                }
                @if (!hideCloseButton) {
                  <button
                    (click)="close.emit()"
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Kapat"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                }
              </div>
            }

            <!-- Body -->
            <div [class]="bodyClasses">
              <ng-content></ng-content>
            </div>

            <!-- Footer -->
            @if (hasFooter) {
              <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                <ng-content select="[footer]"></ng-content>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() size: ModalSize = 'md';
  @Input() hideCloseButton: boolean = false;
  @Input() closeOnBackdrop: boolean = true;
  @Input() hasFooter: boolean = false;
  @Input() noPadding: boolean = false;

  @Output() close = new EventEmitter<void>();

  get modalClasses(): string {
    const baseClasses = 'bg-white rounded-lg shadow-xl transform transition-all';

    const sizeClasses: Record<ModalSize, string> = {
      sm: 'w-full max-w-sm',
      md: 'w-full max-w-md',
      lg: 'w-full max-w-lg',
      xl: 'w-full max-w-2xl',
      full: 'w-full max-w-6xl',
    };

    return `${baseClasses} ${sizeClasses[this.size]}`;
  }

  get bodyClasses(): string {
    return this.noPadding ? 'overflow-auto max-h-[60vh]' : 'p-6 overflow-auto max-h-[60vh]';
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.close.emit();
    }
  }
}
