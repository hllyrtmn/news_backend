/**
 * User Form Component (Smart)
 *
 * Create and edit users
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
import { UserService } from '../services/user.service';

// Components
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

// Helpers & Utils
import { FormHelper } from '../../../shared/helpers/form.helper';
import { ValidationUtils } from '../../../shared/utils/validation.utils';

// Types & Constants
import { UserFormData } from '../../../shared/models/user.types';
import { ADMIN_ROUTES } from '../../../shared/constants/routes.constants';

@Component({
  selector: 'app-user-form',
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
            {{ isEditMode() ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı' }}
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            {{ isEditMode() ? 'Mevcut kullanıcıyı düzenleyin' : 'Yeni bir kullanıcı oluşturun' }}
          </p>
        </div>
        <a
          [routerLink]="usersRoute"
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
        <div class="mx-auto max-w-3xl">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Personal Info Card -->
            <app-card>
              <div header class="font-semibold text-gray-900">Kişisel Bilgiler</div>
              <div body class="space-y-4">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <!-- First Name -->
                  <app-form-field
                    label="Ad"
                    [required]="true"
                    [error]="getFieldError('firstName')"
                  >
                    <input
                      type="text"
                      formControlName="firstName"
                      placeholder="Ad"
                      class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </app-form-field>

                  <!-- Last Name -->
                  <app-form-field
                    label="Soyad"
                    [required]="true"
                    [error]="getFieldError('lastName')"
                  >
                    <input
                      type="text"
                      formControlName="lastName"
                      placeholder="Soyad"
                      class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </app-form-field>
                </div>

                <!-- Username -->
                <app-form-field
                  label="Kullanıcı Adı"
                  [required]="true"
                  [error]="getFieldError('username')"
                  helpText="Sadece harf, rakam ve alt çizgi (_) kullanabilirsiniz"
                >
                  <input
                    type="text"
                    formControlName="username"
                    placeholder="kullaniciadi"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </app-form-field>

                <!-- Email -->
                <app-form-field
                  label="E-posta"
                  [required]="true"
                  [error]="getFieldError('email')"
                >
                  <input
                    type="email"
                    formControlName="email"
                    placeholder="ornek@example.com"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </app-form-field>

                <!-- Password (only for new users) -->
                @if (!isEditMode()) {
                  <app-form-field
                    label="Şifre"
                    [required]="true"
                    [error]="getFieldError('password')"
                    helpText="En az 8 karakter olmalıdır"
                  >
                    <input
                      type="password"
                      formControlName="password"
                      placeholder="********"
                      class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </app-form-field>
                }
              </div>
            </app-card>

            <!-- Role & Permissions Card -->
            <app-card>
              <div header class="font-semibold text-gray-900">Rol ve İzinler</div>
              <div body class="space-y-4">
                <!-- Role -->
                <app-form-field
                  label="Rol"
                  [required]="true"
                  helpText="Kullanıcının sistem içindeki rolü"
                >
                  <select
                    formControlName="role"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="user">Kullanıcı - Temel yetkiler</option>
                    <option value="author">Yazar - Makale yazabilir</option>
                    <option value="editor">Editör - Makaleleri düzenleyebilir</option>
                    <option value="admin">Admin - Tam yetkili</option>
                  </select>
                </app-form-field>

                <!-- Staff Status -->
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    formControlName="isStaff"
                    id="isStaff"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label for="isStaff" class="ml-2 text-sm text-gray-700">
                    Personel (Staff) - Admin paneline erişebilir
                  </label>
                </div>

                <!-- Active Status -->
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    formControlName="isActive"
                    id="isActive"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label for="isActive" class="ml-2 text-sm text-gray-700">
                    Aktif - Kullanıcı giriş yapabilir
                  </label>
                </div>
              </div>
            </app-card>

            <!-- Bio Card (Optional) -->
            <app-card>
              <div header class="font-semibold text-gray-900">Ek Bilgiler</div>
              <div body class="space-y-4">
                <!-- Bio -->
                <app-form-field
                  label="Biyografi"
                  helpText="Kullanıcı hakkında kısa bilgi"
                >
                  <textarea
                    formControlName="bio"
                    rows="3"
                    maxlength="500"
                    placeholder="Kullanıcı hakkında..."
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                  <div class="mt-1 text-xs text-gray-500 text-right">
                    {{ form.get('bio')?.value?.length || 0 }} / 500
                  </div>
                </app-form-field>

                <!-- Website -->
                <app-form-field
                  label="Website"
                  [error]="getFieldError('website')"
                >
                  <input
                    type="url"
                    formControlName="website"
                    placeholder="https://example.com"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </app-form-field>
              </div>
            </app-card>

            <!-- Actions -->
            <div class="flex items-center justify-between rounded-lg bg-white p-4 shadow">
              <button
                type="button"
                (click)="onCancel()"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                [disabled]="form.invalid || saving()"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ saving() ? 'Kaydediliyor...' : (isEditMode() ? 'Güncelle' : 'Oluştur') }}
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly usersRoute = ADMIN_ROUTES.users;

  // State signals
  loading = signal(true);
  saving = signal(false);
  isEditMode = signal(false);
  userId = signal<number | null>(null);

  // Form
  form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: ['user', [Validators.required]],
    isStaff: [false],
    isActive: [true],
    bio: ['', [Validators.maxLength(500)]],
    website: ['', [Validators.pattern(/^https?:\/\/.+/)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.userId.set(+id);
      this.loadUser(+id);

      // Remove password requirement for edit mode
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    } else {
      // Password is required for new users
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.loading.set(false);
    }
  }

  private loadUser(id: number): void {
    this.userService.getUser(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        if (user) {
          this.form.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            role: user.role || 'user',
            isStaff: user.isStaff,
            isActive: user.isActive,
            bio: user.bio,
            website: user.website,
          });
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

    // Custom error messages for specific fields
    if (fieldName === 'username' && errorKey === 'pattern') {
      return 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir';
    }
    if (fieldName === 'website' && errorKey === 'pattern') {
      return 'Geçerli bir URL girin (http:// veya https:// ile başlamalı)';
    }

    return FormHelper.getErrorMessage(errorKey, errors[errorKey]);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      FormHelper.markFormGroupTouched(this.form);
      return;
    }

    this.saving.set(true);

    const formData: UserFormData = {
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      username: this.form.value.username,
      email: this.form.value.email,
      password: this.form.value.password,
      role: this.form.value.role,
      isStaff: this.form.value.isStaff,
      isActive: this.form.value.isActive,
      bio: this.form.value.bio,
      website: this.form.value.website,
    };

    const request = this.isEditMode()
      ? this.userService.updateUser(this.userId()!, formData)
      : this.userService.createUser(formData);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: user => {
        this.saving.set(false);
        if (user) {
          this.router.navigate([this.usersRoute]);
        }
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate([this.usersRoute]);
  }
}
