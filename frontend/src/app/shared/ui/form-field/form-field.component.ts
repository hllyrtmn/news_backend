/**
 * Form Field Component (Dumb)
 *
 * Reusable form field wrapper with label, error messages, and help text
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="mb-4">
      <!-- Label -->
      @if (label) {
        <label [for]="id" [class]="labelClasses">
          {{ label }}
          @if (required) {
            <span class="text-red-500 ml-1">*</span>
          }
        </label>
      }

      <!-- Input Slot -->
      <div [class]="inputWrapperClasses">
        <ng-content></ng-content>
      </div>

      <!-- Help Text -->
      @if (helpText && !error) {
        <p class="mt-1 text-sm text-gray-500">
          {{ helpText }}
        </p>
      }

      <!-- Error Message -->
      @if (error) {
        <p class="mt-1 text-sm text-red-600">
          {{ error }}
        </p>
      }
    </div>
  `,
})
export class FormFieldComponent {
  @Input() label: string = '';
  @Input() id: string = '';
  @Input() error: string = '';
  @Input() helpText: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;

  get labelClasses(): string {
    const base = 'block text-sm font-medium mb-1';
    const color = this.disabled ? 'text-gray-400' : 'text-gray-700';
    return `${base} ${color}`;
  }

  get inputWrapperClasses(): string {
    return this.error ? 'form-field-error' : '';
  }
}
