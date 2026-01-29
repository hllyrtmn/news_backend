/**
 * Article Form Component (Smart)
 *
 * Create and edit articles with rich text editor
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
import { ArticleService } from '../services/article.service';

// Components
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

// Helpers & Utils
import { FormHelper } from '../../../shared/helpers/form.helper';
import { StringUtils } from '../../../shared/utils/string.utils';

// Types & Constants
import { Article, ArticleFormData } from '../../../shared/models/article.types';
import { ARTICLE_STATUS } from '../../../shared/constants/app.constants';
import { ADMIN_ROUTES } from '../../../shared/constants/routes.constants';

@Component({
  selector: 'app-article-form',
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
            {{ isEditMode() ? 'Makale Düzenle' : 'Yeni Makale' }}
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            {{ isEditMode() ? 'Mevcut makaleyi düzenleyin' : 'Yeni bir makale oluşturun' }}
          </p>
        </div>
        <a
          [routerLink]="articlesRoute"
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
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Main Content (2/3) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Basic Info Card -->
            <app-card>
              <div header class="font-semibold text-gray-900">Temel Bilgiler</div>
              <div body class="space-y-4">
                <!-- Title -->
                <app-form-field
                  label="Başlık"
                  [required]="true"
                  [error]="getFieldError('title')"
                >
                  <input
                    type="text"
                    formControlName="title"
                    (blur)="onTitleBlur()"
                    placeholder="Makale başlığı girin"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </app-form-field>

                <!-- Slug -->
                <app-form-field
                  label="Slug"
                  [required]="true"
                  [error]="getFieldError('slug')"
                  helpText="URL-friendly başlık (otomatik oluşturulur)"
                >
                  <input
                    type="text"
                    formControlName="slug"
                    placeholder="makale-slug"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </app-form-field>

                <!-- Excerpt -->
                <app-form-field
                  label="Özet"
                  [error]="getFieldError('excerpt')"
                  helpText="Makale özeti (maksimum 200 karakter)"
                >
                  <textarea
                    formControlName="excerpt"
                    rows="3"
                    maxlength="200"
                    placeholder="Makale özeti..."
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                  <div class="mt-1 text-xs text-gray-500 text-right">
                    {{ form.get('excerpt')?.value?.length || 0 }} / 200
                  </div>
                </app-form-field>

                <!-- Content -->
                <app-form-field
                  label="İçerik"
                  [required]="true"
                  [error]="getFieldError('content')"
                >
                  <textarea
                    formControlName="content"
                    rows="15"
                    placeholder="Makale içeriğini buraya yazın..."
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                  <div class="mt-2 text-xs text-gray-500">
                    Markdown formatı desteklenmektedir
                  </div>
                </app-form-field>
              </div>
            </app-card>

            <!-- SEO Card -->
            <app-card>
              <div header class="font-semibold text-gray-900">SEO Ayarları</div>
              <div body class="space-y-4">
                <app-form-field
                  label="Meta Başlık"
                  helpText="Arama motorları için başlık (boş bırakılırsa makale başlığı kullanılır)"
                >
                  <input
                    type="text"
                    formControlName="metaTitle"
                    maxlength="60"
                    placeholder="SEO başlığı"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div class="mt-1 text-xs text-gray-500 text-right">
                    {{ form.get('metaTitle')?.value?.length || 0 }} / 60
                  </div>
                </app-form-field>

                <app-form-field
                  label="Meta Açıklama"
                  helpText="Arama motorları için açıklama"
                >
                  <textarea
                    formControlName="metaDescription"
                    rows="2"
                    maxlength="160"
                    placeholder="SEO açıklaması"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                  <div class="mt-1 text-xs text-gray-500 text-right">
                    {{ form.get('metaDescription')?.value?.length || 0 }} / 160
                  </div>
                </app-form-field>
              </div>
            </app-card>
          </div>

          <!-- Sidebar (1/3) -->
          <div class="space-y-6">
            <!-- Publish Card -->
            <app-card>
              <div header class="font-semibold text-gray-900">Yayınlama</div>
              <div body class="space-y-4">
                <!-- Status -->
                <app-form-field label="Durum" [required]="true">
                  <select
                    formControlName="status"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option [value]="ARTICLE_STATUS.DRAFT">Taslak</option>
                    <option [value]="ARTICLE_STATUS.PUBLISHED">Yayınla</option>
                    <option [value]="ARTICLE_STATUS.ARCHIVED">Arşivle</option>
                  </select>
                </app-form-field>

                <!-- Publish Date -->
                @if (form.get('status')?.value === ARTICLE_STATUS.PUBLISHED) {
                  <app-form-field label="Yayın Tarihi">
                    <input
                      type="datetime-local"
                      formControlName="publishedAt"
                      class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </app-form-field>
                }
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
                  type="submit"
                  [disabled]="form.invalid || saving()"
                  class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ saving() ? 'Kaydediliyor...' : (isEditMode() ? 'Güncelle' : 'Oluştur') }}
                </button>
              </div>
            </app-card>

            <!-- Category Card -->
            <app-card>
              <div header class="font-semibold text-gray-900">Kategori</div>
              <div body>
                <app-form-field label="Kategori">
                  <select
                    formControlName="categoryId"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option [value]="null">Kategori Seçin</option>
                    @for (category of categories(); track category.id) {
                      <option [value]="category.id">{{ category.name }}</option>
                    }
                  </select>
                </app-form-field>
              </div>
            </app-card>

            <!-- Tags Card -->
            <app-card>
              <div header class="font-semibold text-gray-900">Etiketler</div>
              <div body>
                <app-form-field
                  label="Etiketler"
                  helpText="Virgülle ayırarak birden fazla etiket ekleyebilirsiniz"
                >
                  <input
                    type="text"
                    formControlName="tags"
                    placeholder="react, javascript, typescript"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </app-form-field>

                <!-- Selected Tags -->
                @if (selectedTags().length > 0) {
                  <div class="flex flex-wrap gap-2 mt-3">
                    @for (tag of selectedTags(); track tag) {
                      <span class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                        {{ tag }}
                        <button
                          type="button"
                          (click)="removeTag(tag)"
                          class="ml-1 hover:text-blue-900"
                        >
                          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    }
                  </div>
                }
              </div>
            </app-card>

            <!-- Featured Image Card -->
            <app-card>
              <div header class="font-semibold text-gray-900">Öne Çıkan Görsel</div>
              <div body>
                @if (featuredImagePreview()) {
                  <div class="relative">
                    <img
                      [src]="featuredImagePreview()"
                      alt="Featured"
                      class="w-full rounded-lg"
                    />
                    <button
                      type="button"
                      (click)="removeFeaturedImage()"
                      class="absolute top-2 right-2 rounded-full bg-red-600 p-2 text-white hover:bg-red-700"
                    >
                      <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                } @else {
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div class="mt-2">
                      <label class="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                        Görsel Seç
                        <input
                          type="file"
                          accept="image/*"
                          (change)="onImageSelect($event)"
                          class="hidden"
                        />
                      </label>
                    </div>
                    <p class="mt-1 text-xs text-gray-500">PNG, JPG, GIF (Max 5MB)</p>
                  </div>
                }
              </div>
            </app-card>
          </div>
        </form>
      }
    </div>
  `,
})
export class ArticleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly articleService = inject(ArticleService);
  private readonly destroyRef = inject(DestroyRef);

  // Route constants
  protected readonly articlesRoute = ADMIN_ROUTES.articles;
  protected readonly ARTICLE_STATUS = ARTICLE_STATUS;

  // State signals
  loading = signal(true);
  saving = signal(false);
  isEditMode = signal(false);
  articleId = signal<number | null>(null);
  categories = signal<any[]>([]);
  selectedTags = signal<string[]>([]);
  featuredImagePreview = signal<string | null>(null);

  // Form
  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    slug: ['', [Validators.required]],
    excerpt: ['', [Validators.maxLength(200)]],
    content: ['', [Validators.required, Validators.minLength(10)]],
    status: [ARTICLE_STATUS.DRAFT, [Validators.required]],
    categoryId: [null],
    tags: [''],
    featuredImage: [null],
    publishedAt: [null],
    metaTitle: ['', [Validators.maxLength(60)]],
    metaDescription: ['', [Validators.maxLength(160)]],
  });

  ngOnInit(): void {
    // Check if edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.articleId.set(+id);
      this.loadArticle(+id);
    } else {
      this.loading.set(false);
    }

    this.loadCategories();

    // Watch tags input
    this.form.get('tags')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (value) {
          const tags = value.split(',').map((t: string) => t.trim()).filter((t: string) => t);
          this.selectedTags.set(tags);
        } else {
          this.selectedTags.set([]);
        }
      });
  }

  private loadArticle(id: number): void {
    this.articleService.getArticle(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(article => {
        if (article) {
          this.form.patchValue({
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            content: article.content,
            status: article.status,
            categoryId: article.category?.id,
            tags: article.tags.map(t => t.name).join(', '),
            publishedAt: article.publishedAt,
          });

          if (article.featuredImage) {
            this.featuredImagePreview.set(article.featuredImage);
          }
        }
        this.loading.set(false);
      });
  }

  private loadCategories(): void {
    // TODO: Load from category service
    this.categories.set([
      { id: 1, name: 'Teknoloji' },
      { id: 2, name: 'Yazılım' },
      { id: 3, name: 'Tasarım' },
    ]);
  }

  onTitleBlur(): void {
    const title = this.form.get('title')?.value;
    const slug = this.form.get('slug')?.value;

    // Auto-generate slug if empty
    if (title && !slug) {
      this.form.patchValue({
        slug: StringUtils.slugify(title),
      });
    }
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.featuredImagePreview.set(e.target.result);
        this.form.patchValue({ featuredImage: file });
      };
      reader.readAsDataURL(file);
    }
  }

  removeFeaturedImage(): void {
    this.featuredImagePreview.set(null);
    this.form.patchValue({ featuredImage: null });
  }

  removeTag(tag: string): void {
    const tags = this.selectedTags().filter(t => t !== tag);
    this.selectedTags.set(tags);
    this.form.patchValue({ tags: tags.join(', ') });
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

    const formData: ArticleFormData = {
      title: this.form.value.title,
      slug: this.form.value.slug,
      excerpt: this.form.value.excerpt || '',
      content: this.form.value.content,
      status: this.form.value.status,
      categoryId: this.form.value.categoryId,
      tagNames: this.selectedTags(),
      featuredImage: this.form.value.featuredImage,
      publishedAt: this.form.value.publishedAt,
      metaTitle: this.form.value.metaTitle,
      metaDescription: this.form.value.metaDescription,
    };

    const request = this.isEditMode()
      ? this.articleService.updateArticle(this.articleId()!, formData)
      : this.articleService.createArticle(formData);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: article => {
        this.saving.set(false);
        if (article) {
          this.router.navigate([this.articlesRoute]);
        }
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate([this.articlesRoute]);
  }
}
