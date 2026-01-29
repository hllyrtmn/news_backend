/**
 * Confirmation Dialog Component (Dumb)
 *
 * Reusable confirmation dialog for destructive actions
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ConfirmationType = 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"></div>

      <!-- Dialog -->
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all"
            role="alertdialog"
            aria-modal="true"
          >
            <!-- Content -->
            <div class="p-6">
              <!-- Icon -->
              <div [class]="iconWrapperClasses">
                <svg
                  [class]="iconClasses"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  @if (type === 'danger') {
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  } @else if (type === 'warning') {
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  } @else {
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  }
                </svg>
              </div>

              <!-- Title & Message -->
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  {{ title }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ message }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
              <button
                (click)="cancel.emit()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                [disabled]="loading"
              >
                {{ cancelText }}
              </button>
              <button
                (click)="confirm.emit()"
                [class]="confirmButtonClasses"
                [disabled]="loading"
              >
                @if (loading) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmationDialogComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Emin misiniz?';
  @Input() message: string = 'Bu işlem geri alınamaz.';
  @Input() confirmText: string = 'Onayla';
  @Input() cancelText: string = 'İptal';
  @Input() type: ConfirmationType = 'warning';
  @Input() loading: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  get iconWrapperClasses(): string {
    const base = 'mx-auto flex h-12 w-12 items-center justify-center rounded-full';

    const typeClasses: Record<ConfirmationType, string> = {
      danger: 'bg-red-100',
      warning: 'bg-yellow-100',
      info: 'bg-blue-100',
    };

    return `${base} ${typeClasses[this.type]}`;
  }

  get iconClasses(): string {
    const base = 'h-6 w-6';

    const typeClasses: Record<ConfirmationType, string> = {
      danger: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-blue-600',
    };

    return `${base} ${typeClasses[this.type]}`;
  }

  get confirmButtonClasses(): string {
    const base = 'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center';

    const typeClasses: Record<ConfirmationType, string> = {
      danger: 'bg-red-600 hover:bg-red-700',
      warning: 'bg-yellow-600 hover:bg-yellow-700',
      info: 'bg-blue-600 hover:bg-blue-700',
    };

    return `${base} ${typeClasses[this.type]}`;
  }
}
