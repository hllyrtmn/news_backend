/**
 * Settings Component (Smart)
 *
 * Site settings management
 */

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Services
import { SettingsService } from './services/settings.service';

// Components
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

// Helpers
import { FormHelper } from '../../shared/helpers/form.helper';

@Component({
  selector: 'app-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    FormFieldComponent,
    CardComponent,
    SpinnerComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Site Ayarları</h1>
        <p class="mt-1 text-sm text-gray-500">
          Site genelindeki ayarları buradan yönetebilirsiniz
        </p>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <app-spinner size="lg"></app-spinner>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- General Settings -->
          <app-card>
            <div header class="font-semibold text-gray-900">Genel Ayarlar</div>
            <div body class="space-y-4">
              <!-- Site Name -->
              <app-form-field
                label="Site Adı"
                [required]="true"
                [error]="getFieldError('siteName')"
              >
                <input
                  type="text"
                  formControlName="siteName"
                  placeholder="Haber Sitesi"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </app-form-field>

              <!-- Site Description -->
              <app-form-field
                label="Site Açıklaması"
                [error]="getFieldError('siteDescription')"
              >
                <textarea
                  formControlName="siteDescription"
                  rows="3"
                  maxlength="200"
                  placeholder="Site açıklaması..."
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                ></textarea>
                <div class="mt-1 text-xs text-gray-500 text-right">
                  {{ form.get('siteDescription')?.value?.length || 0 }} / 200
                </div>
              </app-form-field>

              <!-- Contact Email -->
              <app-form-field
                label="İletişim E-postası"
                [required]="true"
                [error]="getFieldError('contactEmail')"
              >
                <input
                  type="email"
                  formControlName="contactEmail"
                  placeholder="iletisim@example.com"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </app-form-field>

              <!-- Items Per Page -->
              <app-form-field
                label="Sayfa Başına Makale Sayısı"
                [required]="true"
                [error]="getFieldError('itemsPerPage')"
              >
                <input
                  type="number"
                  formControlName="itemsPerPage"
                  min="5"
                  max="100"
                  placeholder="20"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </app-form-field>
            </div>
          </app-card>

          <!-- SEO Settings -->
          <app-card>
            <div header class="font-semibold text-gray-900">SEO Ayarları</div>
            <div body class="space-y-4">
              <!-- Meta Title -->
              <app-form-field
                label="Meta Başlık"
                [error]="getFieldError('metaTitle')"
                helpText="Arama motorlarında görünecek başlık"
              >
                <input
                  type="text"
                  formControlName="metaTitle"
                  maxlength="60"
                  placeholder="Site meta başlığı"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div class="mt-1 text-xs text-gray-500 text-right">
                  {{ form.get('metaTitle')?.value?.length || 0 }} / 60
                </div>
              </app-form-field>

              <!-- Meta Description -->
              <app-form-field
                label="Meta Açıklama"
                [error]="getFieldError('metaDescription')"
              >
                <textarea
                  formControlName="metaDescription"
                  rows="2"
                  maxlength="160"
                  placeholder="Site meta açıklaması"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                ></textarea>
                <div class="mt-1 text-xs text-gray-500 text-right">
                  {{ form.get('metaDescription')?.value?.length || 0 }} / 160
                </div>
              </app-form-field>

              <!-- Meta Keywords -->
              <app-form-field
                label="Meta Anahtar Kelimeler"
                helpText="Virgülle ayırarak yazın"
              >
                <input
                  type="text"
                  formControlName="metaKeywords"
                  placeholder="haber, teknoloji, yazılım"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </app-form-field>
            </div>
          </app-card>

          <!-- Social Media -->
          <app-card>
            <div header class="font-semibold text-gray-900">Sosyal Medya</div>
            <div body class="space-y-4">
              <!-- Twitter -->
              <app-form-field label="Twitter URL">
                <input
                  type="url"
                  formControlName="twitterUrl"
                  placeholder="https://twitter.com/username"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </app-form-field>

              <!-- Facebook -->
              <app-form-field label="Facebook URL">
                <input
                  type="url"
                  formControlName="facebookUrl"
                  placeholder="https://facebook.com/page"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </app-form-field>

              <!-- Instagram -->
              <app-form-field label="Instagram URL">
                <input
                  type="url"
                  formControlName="instagramUrl"
                  placeholder="https://instagram.com/username"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </app-form-field>

              <!-- LinkedIn -->
              <app-form-field label="LinkedIn URL">
                <input
                  type="url"
                  formControlName="linkedinUrl"
                  placeholder="https://linkedin.com/company/name"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </app-form-field>
            </div>
          </app-card>

          <!-- Features -->
          <app-card>
            <div header class="font-semibold text-gray-900">Özellikler</div>
            <div body class="space-y-4">
              <!-- Enable Comments -->
              <div class="flex items-center">
                <input
                  type="checkbox"
                  formControlName="enableComments"
                  id="enableComments"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="enableComments" class="ml-2 text-sm text-gray-700">
                  Yorumlara izin ver
                </label>
              </div>

              <!-- Require Comment Moderation -->
              <div class="flex items-center">
                <input
                  type="checkbox"
                  formControlName="requireCommentModeration"
                  id="requireCommentModeration"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="requireCommentModeration" class="ml-2 text-sm text-gray-700">
                  Yorumlar için moderasyon gerekli
                </label>
              </div>

              <!-- Enable Newsletter -->
              <div class="flex items-center">
                <input
                  type="checkbox"
                  formControlName="enableNewsletter"
                  id="enableNewsletter"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="enableNewsletter" class="ml-2 text-sm text-gray-700">
                  Bülten aboneliğini etkinleştir
                </label>
              </div>

              <!-- Maintenance Mode -->
              <div class="flex items-center">
                <input
                  type="checkbox"
                  formControlName="maintenanceMode"
                  id="maintenanceMode"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="maintenanceMode" class="ml-2 text-sm text-gray-700">
                  <span class="text-red-600 font-medium">Bakım modu</span>
                  <span class="ml-1 text-gray-500">(Site ziyaretçilere kapatılır)</span>
                </label>
              </div>
            </div>
          </app-card>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3 rounded-lg bg-white p-4 shadow">
            <button
              type="button"
              (click)="resetForm()"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sıfırla
            </button>
            <button
              type="submit"
              [disabled]="form.invalid || saving()"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ saving() ? 'Kaydediliyor...' : 'Kaydet' }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  private readonly destroyRef = inject(DestroyRef);

  // State signals
  loading = signal(true);
  saving = signal(false);

  // Form
  form: FormGroup = this.fb.group({
    // General
    siteName: ['', [Validators.required, Validators.minLength(2)]],
    siteDescription: ['', [Validators.maxLength(200)]],
    contactEmail: ['', [Validators.required, Validators.email]],
    itemsPerPage: [20, [Validators.required, Validators.min(5), Validators.max(100)]],

    // SEO
    metaTitle: ['', [Validators.maxLength(60)]],
    metaDescription: ['', [Validators.maxLength(160)]],
    metaKeywords: [''],

    // Social
    twitterUrl: [''],
    facebookUrl: [''],
    instagramUrl: [''],
    linkedinUrl: [''],

    // Features
    enableComments: [true],
    requireCommentModeration: [true],
    enableNewsletter: [false],
    maintenanceMode: [false],
  });

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.settingsService.loadSettings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(settings => {
        if (settings) {
          this.form.patchValue(settings);
        }
        this.loading.set(false);
      });
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

  onSubmit(): void {
    if (this.form.invalid) {
      FormHelper.markFormGroupTouched(this.form);
      return;
    }

    this.saving.set(true);

    this.settingsService.updateSettings(this.form.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
        },
        error: () => {
          this.saving.set(false);
        },
      });
  }

  resetForm(): void {
    this.loadSettings();
  }
}
