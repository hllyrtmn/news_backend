/**
 * Tag Form Component (Smart)
 *
 * Create and edit tags
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
import { AdminTagService, TagFormData } from '../services/tag.service';

// Components
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

// Helpers & Utils
import { FormHelper } from '../../../shared/helpers/form.helper';
import { StringUtils } from '../../../shared/utils/string.utils';

@Component({
  selector: 'app-tag-form',
  standalone: true,
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
            {{ isEditMode() ? 'Etiket Düzenle' : 'Yeni Etiket' }}
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            {{ isEditMode() ? 'Mevcut etiketi düzenleyin' : 'Yeni bir etiket oluşturun' }}
          </p>
        </div>
        <a
          routerLink="/admin/tags"
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
            <div header class="font-semibold text-gray-900">Etiket Bilgileri</div>
            <div body>
              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
                <!-- Name -->
                <app-form-field
                  label="Etiket Adı"
                  [required]="true"
                  [error]="getFieldError('name')"
                >
                  <input
                    type="text"
                    formControlName="name"
                    (blur)="onNameBlur()"
                    placeholder="Etiket adı girin"
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
                    placeholder="etiket-slug"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tagService = inject(AdminTagService);
  private readonly destroyRef = inject(DestroyRef);

  // State signals
  loading = signal(true);
  saving = signal(false);
  isEditMode = signal(false);
  tagId = signal<number | null>(null);

  // Form
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    slug: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.tagId.set(+id);
      this.loadTag(+id);
    } else {
      this.loading.set(false);
    }
  }

  private loadTag(id: number): void {
    this.tagService.getTag(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(tag => {
        if (tag) {
          this.form.patchValue({
            name: tag.name,
            slug: tag.slug,
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

    const formData: TagFormData = {
      name: this.form.value.name,
      slug: this.form.value.slug,
    };

    const request = this.isEditMode()
      ? this.tagService.updateTag(this.tagId()!, formData)
      : this.tagService.createTag(formData);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: tag => {
        this.saving.set(false);
        if (tag) {
          this.router.navigate(['/admin/tags']);
        }
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/tags']);
  }
}
