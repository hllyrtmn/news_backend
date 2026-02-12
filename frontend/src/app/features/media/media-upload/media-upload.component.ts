/**
 * Media Upload Component (Smart)
 *
 * Upload and manage media files
 */

import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Services
import { MediaService } from '../../../shared/services/media.service';

// Components
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { CardComponent } from '../../../shared/ui/card/card.component';

// Helpers
import { FormHelper } from '../../../shared/helpers/form.helper';
import { NotificationHelper } from '../../../shared/helpers/notification.helper';

@Component({
  selector: 'app-media-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    FormFieldComponent,
    CardComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Medya Yükle</h1>
          <p class="mt-1 text-sm text-gray-500">
            Yeni medya dosyası yükleyin
          </p>
        </div>
        <a
          routerLink="/admin/media"
          class="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Geri Dön
        </a>
      </div>

      <div class="mx-auto max-w-2xl">
        <app-card>
          <div header class="font-semibold text-gray-900">Dosya Yükleme</div>
          <div body>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
              <!-- File Upload -->
              <app-form-field
                label="Dosya"
                [required]="true"
                [error]="uploadError()"
              >
                <div class="space-y-3">
                  <input
                    type="file"
                    (change)="onFileSelect($event)"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    class="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                  />
                  @if (selectedFile()) {
                    <div class="rounded-lg bg-gray-50 p-3">
                      <p class="text-sm text-gray-900">{{ selectedFile()!.name }}</p>
                      <p class="text-xs text-gray-500">{{ getFileSize(selectedFile()!.size) }}</p>
                    </div>
                  }

                  <!-- Preview -->
                  @if (previewUrl()) {
                    <div class="overflow-hidden rounded-lg">
                      <img
                        [src]="previewUrl()"
                        alt="Preview"
                        class="max-h-64 w-full object-contain"
                      />
                    </div>
                  }
                </div>
              </app-form-field>

              <!-- Title -->
              <app-form-field
                label="Başlık"
                [required]="true"
                [error]="getFieldError('title')"
              >
                <input
                  type="text"
                  formControlName="title"
                  placeholder="Dosya başlığı girin"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </app-form-field>

              <!-- Alt Text (for images) -->
              @if (fileType() === 'image') {
                <app-form-field
                  label="Alt Metni"
                  helpText="Erişilebilirlik için görsel açıklaması"
                >
                  <input
                    type="text"
                    formControlName="alt_text"
                    placeholder="Görsel açıklaması"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </app-form-field>
              }

              <!-- Caption -->
              <app-form-field
                label="Açıklama"
              >
                <textarea
                  formControlName="caption"
                  rows="3"
                  placeholder="Dosya açıklaması..."
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                ></textarea>
              </app-form-field>

              <!-- Copyright Holder -->
              <app-form-field
                label="Telif Hakkı Sahibi"
              >
                <input
                  type="text"
                  formControlName="copyright_holder"
                  placeholder="Telif hakkı sahibi"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </app-form-field>

              <!-- Upload Progress -->
              @if (uploading()) {
                <div class="rounded-lg bg-blue-50 p-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <svg class="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-blue-900">Yükleniyor...</p>
                      <p class="text-xs text-blue-700">Lütfen bekleyin</p>
                    </div>
                  </div>
                </div>
              }
            </form>
          </div>
          <div footer class="flex items-center justify-between">
            <button
              type="button"
              (click)="onCancel()"
              [disabled]="uploading()"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              İptal
            </button>
            <button
              (click)="onSubmit()"
              [disabled]="!selectedFile() || form.invalid || uploading()"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {{ uploading() ? 'Yükleniyor...' : 'Yükle' }}
            </button>
          </div>
        </app-card>
      </div>
    </div>
  `,
})
export class MediaUploadComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly mediaService = inject(MediaService);

  // State signals
  uploading = signal(false);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  fileType = signal<string>('');
  uploadError = signal('');

  // Form
  form: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    alt_text: [''],
    caption: [''],
    copyright_holder: [''],
  });

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);
      this.uploadError.set('');

      // Set file type
      if (file.type.startsWith('image/')) {
        this.fileType.set('image');
        // Generate preview for images
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrl.set(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        this.fileType.set('video');
        this.previewUrl.set(null);
      } else if (file.type.startsWith('audio/')) {
        this.fileType.set('audio');
        this.previewUrl.set(null);
      } else {
        this.fileType.set('document');
        this.previewUrl.set(null);
      }

      // Auto-fill title from filename if empty
      if (!this.form.get('title')?.value) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        this.form.patchValue({ title: fileName });
      }
    }
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    const errors = control.errors;
    const errorKey = Object.keys(errors)[0];
    return FormHelper.getErrorMessage(errorKey, errors[errorKey]);
  }

  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  }

  onSubmit(): void {
    if (!this.selectedFile()) {
      this.uploadError.set('Lütfen bir dosya seçin');
      return;
    }

    if (this.form.invalid) {
      FormHelper.markFormGroupTouched(this.form);
      return;
    }

    this.uploading.set(true);

    const uploadData = {
      title: this.form.value.title,
      file_type: this.fileType() as 'image' | 'video' | 'audio' | 'document',
      alt_text: this.form.value.alt_text,
      caption: this.form.value.caption,
      copyright_holder: this.form.value.copyright_holder,
    };

    this.mediaService.uploadMedia(this.selectedFile()!, uploadData).subscribe({
      next: () => {
        this.uploading.set(false);
        NotificationHelper.showSuccess('Medya başarıyla yüklendi');
        this.router.navigate(['/admin/media']);
      },
      error: (error) => {
        this.uploading.set(false);
        this.uploadError.set('Yükleme başarısız oldu');
        NotificationHelper.showError('Medya yüklenemedi');
        console.error('Upload error:', error);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/media']);
  }
}
