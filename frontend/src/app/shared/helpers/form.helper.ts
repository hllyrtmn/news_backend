/**
 * Form Helper Functions
 *
 * Helper functions for Angular Reactive Forms
 */

import { FormGroup, FormControl, AbstractControl } from '@angular/forms';

export class FormHelper {
  /**
   * Build FormData from object (for file uploads)
   * @param data Object with form data
   * @returns FormData instance
   */
  static buildFormData(data: Record<string, any>): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          // Single file
          formData.append(key, value);
        } else if (value instanceof FileList) {
          // Multiple files
          Array.from(value).forEach(file => {
            formData.append(key, file);
          });
        } else if (Array.isArray(value)) {
          // Array of values
          value.forEach(item => {
            if (item instanceof File) {
              formData.append(key, item);
            } else {
              formData.append(key, String(item));
            }
          });
        } else if (typeof value === 'object') {
          // Nested object - stringify
          formData.append(key, JSON.stringify(value));
        } else {
          // Primitive value
          formData.append(key, String(value));
        }
      }
    });

    return formData;
  }

  /**
   * Mark all form controls as touched (to show validation errors)
   * @param formGroup FormGroup to mark
   */
  static markFormGroupTouched(formGroup: FormGroup | FormControl): void {
    if (formGroup instanceof FormControl) {
      formGroup.markAsTouched();
      formGroup.markAsDirty();
      return;
    }

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);

      if (control instanceof FormGroup) {
        // Recursive for nested form groups
        this.markFormGroupTouched(control);
      } else if (control) {
        control.markAsTouched();
        control.markAsDirty();
      }
    });
  }

  /**
   * Reset form and clear validators
   * @param formGroup FormGroup to reset
   */
  static resetForm(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.setErrors(null);
        control.markAsUntouched();
        control.markAsPristine();
      }
    });
  }

  /**
   * Get all form errors
   * @param formGroup FormGroup to check
   * @returns Object with field errors
   */
  static getFormErrors(formGroup: FormGroup): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);

      if (control?.errors) {
        errors[key] = Object.keys(control.errors).map(errorKey => {
          // Map error key to user-friendly message
          return this.getErrorMessage(errorKey, control.errors![errorKey]);
        });
      }

      if (control instanceof FormGroup) {
        // Recursive for nested form groups
        const nestedErrors = this.getFormErrors(control);
        Object.keys(nestedErrors).forEach(nestedKey => {
          errors[`${key}.${nestedKey}`] = nestedErrors[nestedKey];
        });
      }
    });

    return errors;
  }

  /**
   * Get user-friendly error message
   * @param errorKey Error key from validator
   * @param errorValue Error value
   * @returns User-friendly message
   */
  static getErrorMessage(errorKey: string, errorValue: any): string {
    const errorMessages: Record<string, string> = {
      'required': 'Bu alan gereklidir',
      'email': 'Geçerli bir e-posta adresi giriniz',
      'minlength': `En az ${errorValue.requiredLength} karakter olmalıdır`,
      'maxlength': `En fazla ${errorValue.requiredLength} karakter olabilir`,
      'min': `En az ${errorValue.min} olmalıdır`,
      'max': `En fazla ${errorValue.max} olabilir`,
      'pattern': 'Geçersiz format',
      'url': 'Geçerli bir URL giriniz',
      'phone': 'Geçerli bir telefon numarası giriniz',
      'mismatch': 'Değerler eşleşmiyor'
    };

    return errorMessages[errorKey] || 'Geçersiz değer';
  }

  /**
   * Set form errors from API response
   * @param formGroup FormGroup to set errors on
   * @param errors Error object from API
   */
  static setServerErrors(formGroup: FormGroup, errors: Record<string, string[] | string>): void {
    Object.entries(errors).forEach(([field, messages]) => {
      const control = formGroup.get(field);

      if (control) {
        const errorMessages = Array.isArray(messages) ? messages : [messages];
        control.setErrors({
          server: errorMessages.join(', ')
        });
        control.markAsTouched();
      }
    });
  }

  /**
   * Check if form field has error
   * @param formGroup FormGroup
   * @param fieldName Field name
   * @param errorType Error type (optional)
   * @returns True if field has error
   */
  static hasError(formGroup: FormGroup, fieldName: string, errorType?: string): boolean {
    const control = formGroup.get(fieldName);

    if (!control) {
      return false;
    }

    if (errorType) {
      return control.hasError(errorType) && (control.touched || control.dirty);
    }

    return control.invalid && (control.touched || control.dirty);
  }

  /**
   * Get first error message for field
   * @param formGroup FormGroup
   * @param fieldName Field name
   * @returns Error message or empty string
   */
  static getFieldError(formGroup: FormGroup, fieldName: string): string {
    const control = formGroup.get(fieldName);

    if (!control?.errors || !control.touched) {
      return '';
    }

    const errorKey = Object.keys(control.errors)[0];
    return this.getErrorMessage(errorKey, control.errors[errorKey]);
  }

  /**
   * Get form values excluding null/undefined
   * @param formGroup FormGroup
   * @returns Clean form values
   */
  static getCleanValues<T>(formGroup: FormGroup): Partial<T> {
    const values = formGroup.value;
    const cleanValues: any = {};

    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleanValues[key] = value;
      }
    });

    return cleanValues;
  }

  /**
   * Patch form values and mark as pristine
   * @param formGroup FormGroup to patch
   * @param values Values to patch
   */
  static patchAndReset(formGroup: FormGroup, values: any): void {
    formGroup.patchValue(values);
    formGroup.markAsPristine();
    formGroup.markAsUntouched();
  }

  /**
   * Disable all form controls
   * @param formGroup FormGroup to disable
   */
  static disableAll(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.disable();
    });
  }

  /**
   * Enable all form controls
   * @param formGroup FormGroup to enable
   */
  static enableAll(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.enable();
    });
  }
}
