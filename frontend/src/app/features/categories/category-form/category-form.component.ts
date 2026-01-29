/**
 * Category Form Component (Smart)
 *
 * Create and edit categories
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
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Services
import { CategoryService } from '../services/category.service';

// Components
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

// Helpers & Utils
import { FormHelper } from '../../../shared/helpers/form.helper';
import { StringUtils } from '../../../shared/utils/string.utils';

// Types & Constants
import { CategoryFormData } from '../../../shared/models/category.types';
import { ADMIN_ROUTES } from '../../../shared/constants/routes.constants';

@Component({
  selector: 'app-category-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    FormFieldComponent,
    CardComponent,
    SpinnerComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isEditMode() ? 'Kategori Düzenle' : 'Yeni Kategori' }}
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            {{ isEditMode() ? 'Mevcut kategoriyi düzenleyin' : 'Yeni bir kategori oluşturun' }}
          </p>
        </div>
        <a
          [routerLink]="categoriesRoute"
          class="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Geri Dön
        </a>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <app-spinner size="lg"></app-spinner>
        </div>
      } @else {
        <div class="mx-auto max-w-2xl">
          <app-card>
            <div header class="font-semibold text-gray-900">Kategori Bilgileri</div>
            <div body>
              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
                <!-- Name -->
                <app-form-field
                  label="Kategori Adı"
                  [required]="true"
                  [error]="getFieldError('name')"
                >
                  <input
                    type="text"
                    formControlName="name"
                    (blur)="onNameBlur()"
                    placeholder="Kategori adı girin"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </app-form-field>

                <!-- Slug -->
                <app-form-field
                  label="Slug"
                  [required]="true"
                  [error]="getFieldError('slug')"
                  helpText="URL-friendly ad (otomatik oluşturulur)"
                >
                  <input
                    type="text"
                    formControlName="slug"
                    placeholder="kategori-slug"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </app-form-field>

                <!-- Description -->
                <app-form-field
                  label="Açıklama"
                  [error]="getFieldError('description')"
                >
                  <textarea
                    formControlName="description"
                    rows="3"
                    placeholder="Kategori açıklaması..."
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </app-form-field>

                <!-- Color -->
                <app-form-field
                  label="Renk"
                  helpText="Kategori için bir renk seçin"
                >
                  <div class="flex items-center space-x-3">
                    <input
                      type="color"
                      formControlName="color"
                      class="h-10 w-20 cursor-pointer rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      [value]="form.get('color')?.value || '#3b82f6'"
                      disabled
                      class="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                    />
                  </div>

                  <!-- Color Presets -->
                  <div class="mt-3 flex flex-wrap gap-2">
                    @for (preset of colorPresets; track preset.value) {
                      <button
                        type="button"
                        (click)="selectColor(preset.value)"
                        [style.background-color]="preset.value"
                        [title]="preset.label"
                        [class]="getColorPresetClass(preset.value)"
                        class="h-8 w-8 rounded-full border-2 transition-all"
                      ></button>
                    }
                  </div>
                </app-form-field>
              </form>
            </div>
            <div footer class="flex items-center justify-between">
              <button
                type="button"
                (click)="onCancel()"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                (click)="onSubmit()"
                [disabled]="form.invalid || saving()"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ saving() ? 'Kaydediliyor...' : (isEditMode() ? 'Güncelle' : 'Oluştur') }}
              </button>
            </div>
          </app-card>
        </div>
      }
    </div>
  `,
})
export class CategoryFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly categoryService = inject(CategoryService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly categoriesRoute = ADMIN_ROUTES.categories;

  // State signals
  loading = signal(true);
  saving = signal(false);
  isEditMode = signal(false);
  categoryId = signal<number | null>(null);

  // Color presets
  protected readonly colorPresets = [
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Green', value: '#10b981' },
    { label: 'Purple', value: '#8b5cf6' },
    { label: 'Red', value: '#ef4444' },
    { label: 'Orange', value: '#f59e0b' },
    { label: 'Pink', value: '#ec4899' },
    { label: 'Indigo', value: '#6366f1' },
    { label: 'Teal', value: '#14b8a6' },
  ];

  // Form
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    slug: ['', [Validators.required]],
    description: [''],
    color: ['#3b82f6'],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.categoryId.set(+id);
      this.loadCategory(+id);
    } else {
      this.loading.set(false);
    }
  }

  private loadCategory(id: number): void {
    this.categoryService.getCategory(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(category => {
        if (category) {
          this.form.patchValue({
            name: category.name,
            slug: category.slug,
            description: category.description,
            color: category.color || '#3b82f6',
          });
        }
        this.loading.set(false);
      });
  }

  onNameBlur(): void {
    const name = this.form.get('name')?.value;
    const slug = this.form.get('slug')?.value;

    if (name && !slug) {
      this.form.patchValue({
        slug: StringUtils.slugify(name),
      });
    }
  }

  selectColor(color: string): void {
    this.form.patchValue({ color });
  }

  getColorPresetClass(color: string): string {
    const currentColor = this.form.get('color')?.value;
    return currentColor === color ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2' : 'border-gray-200';
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

    const formData: CategoryFormData = {
      name: this.form.value.name,
      slug: this.form.value.slug,
      description: this.form.value.description || '',
      color: this.form.value.color,
    };

    const request = this.isEditMode()
      ? this.categoryService.updateCategory(this.categoryId()!, formData)
      : this.categoryService.createCategory(formData);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: category => {
        this.saving.set(false);
        if (category) {
          this.router.navigate([this.categoriesRoute]);
        }
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate([this.categoriesRoute]);
  }
}
