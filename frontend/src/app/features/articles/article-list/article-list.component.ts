/**
 * Article List Component (Smart)
 *
 * Displays paginated list of articles with filtering and bulk actions
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Services
import { ArticleService } from '../services/article.service';

// Components
import { TableComponent, TableColumn, TableSort } from '../../../shared/ui/table/table.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ConfirmationDialogComponent } from '../../../shared/ui/confirmation-dialog/confirmation-dialog.component';

// Pipes
import { DateAgoPipe } from '../../../shared/pipes/date-ago.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

// Types & Constants
import { Article } from '../../../shared/models/article.types';
import { ARTICLE_STATUS } from '../../../shared/constants/app.constants';
import { ADMIN_ROUTES } from '../../../shared/constants/routes.constants';

interface ArticleFilters {
  search?: string;
  status?: string;
  category?: number;
  author?: number;
}

@Component({
  selector: 'app-article-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    SpinnerComponent,
    EmptyStateComponent,
    ConfirmationDialogComponent,
    DateAgoPipe,
    TruncatePipe,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Makaleler</h1>
          <p class="mt-1 text-sm text-gray-500">
            Toplam {{ totalCount() }} makale
          </p>
        </div>
        <a
          [routerLink]="newArticleRoute"
          class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Yeni Makale
        </a>
      </div>

      <!-- Filters -->
      <div class="rounded-lg bg-white p-4 shadow">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Ara
            </label>
            <input
              type="text"
              [(ngModel)]="filters.search"
              (ngModelChange)="onFilterChange()"
              placeholder="Başlık, içerik..."
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Durum
            </label>
            <select
              [(ngModel)]="filters.status"
              (ngModelChange)="onFilterChange()"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tümü</option>
              <option [value]="ARTICLE_STATUS.DRAFT">Taslak</option>
              <option [value]="ARTICLE_STATUS.PUBLISHED">Yayınlandı</option>
              <option [value]="ARTICLE_STATUS.ARCHIVED">Arşivlendi</option>
            </select>
          </div>

          <!-- Category Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              [(ngModel)]="filters.category"
              (ngModelChange)="onFilterChange()"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option [value]="undefined">Tümü</option>
              @for (category of categories(); track category.id) {
                <option [value]="category.id">{{ category.name }}</option>
              }
            </select>
          </div>

          <!-- Clear Filters -->
          <div class="flex items-end">
            <button
              (click)="clearFilters()"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      </div>

      <!-- Bulk Actions -->
      @if (selectedArticles().length > 0) {
        <div class="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-blue-900">
              {{ selectedArticles().length }} makale seçildi
            </span>
            <div class="flex items-center space-x-3">
              <button
                (click)="bulkPublish()"
                [disabled]="bulkActionLoading()"
                class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Yayınla
              </button>
              <button
                (click)="confirmBulkDelete()"
                [disabled]="bulkActionLoading()"
                class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Articles Table -->
      <app-table
        [columns]="columns"
        [data]="articles()"
        [loading]="loading()"
        [selectable]="true"
        [selectedRows]="selectedArticles()"
        [hasActions]="true"
        [sort]="currentSort()"
        emptyText="Makale bulunamadı"
        (sortChange)="onSortChange($event)"
        (selectChange)="onSelectChange($event)"
        (rowClick)="viewArticle($event)"
      >
        <!-- Custom Cell Templates -->
        @for (article of articles(); track article.id) {
          <ng-container [attr.column-title]="article.id">
            <div class="max-w-md">
              <p class="font-medium text-gray-900">{{ article.title }}</p>
              @if (article.excerpt) {
                <p class="mt-1 text-sm text-gray-500">
                  {{ article.excerpt | truncate: 80 }}
                </p>
              }
            </div>
          </ng-container>

          <ng-container [attr.column-status]="article.id">
            <span [class]="getStatusBadgeClass(article.status)">
              {{ getStatusLabel(article.status) }}
            </span>
          </ng-container>

          <ng-container [attr.column-category]="article.id">
            @if (article.category) {
              <span class="text-sm text-gray-900">{{ article.category.name }}</span>
            } @else {
              <span class="text-sm text-gray-400">-</span>
            }
          </ng-container>

          <ng-container [attr.column-author]="article.id">
            <div class="flex items-center">
              @if (article.author.avatar) {
                <img
                  [src]="article.author.avatar"
                  [alt]="article.author.fullName"
                  class="h-8 w-8 rounded-full"
                />
              } @else {
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                  {{ article.author.fullName.charAt(0).toUpperCase() }}
                </div>
              }
              <span class="ml-2 text-sm text-gray-900">{{ article.author.fullName }}</span>
            </div>
          </ng-container>

          <ng-container [attr.column-createdAt]="article.id">
            <span class="text-sm text-gray-500">{{ article.createdAt | dateAgo }}</span>
          </ng-container>

          <div actions>
            <div class="flex items-center space-x-3">
              <a
                [routerLink]="['/admin/articles', article.id, 'edit']"
                class="text-blue-600 hover:text-blue-700"
                (click)="$event.stopPropagation()"
              >
                Düzenle
              </a>
              <button
                (click)="confirmDelete(article); $event.stopPropagation()"
                class="text-red-600 hover:text-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        }
      </app-table>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow">
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-700">
              Sayfa {{ currentPage() }} / {{ totalPages() }}
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <button
              (click)="previousPage()"
              [disabled]="currentPage() === 1 || loading()"
              class="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Önceki
            </button>
            <button
              (click)="nextPage()"
              [disabled]="currentPage() === totalPages() || loading()"
              class="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sonraki
            </button>
          </div>
        </div>
      }

      <!-- Delete Confirmation Dialog -->
      @if (showDeleteDialog()) {
        <app-confirmation-dialog
          title="Makaleyi Sil"
          [message]="deleteDialogMessage()"
          type="danger"
          confirmText="Sil"
          cancelText="İptal"
          (confirm)="handleDelete()"
          (cancel)="cancelDelete()"
        />
      }
    </div>
  `,
})
export class ArticleListComponent implements OnInit {
  private readonly articleService = inject(ArticleService);

  // Route constants
  protected readonly newArticleRoute = `${ADMIN_ROUTES.articles}/new`;
  protected readonly ARTICLE_STATUS = ARTICLE_STATUS;

  // Table configuration
  protected readonly columns: TableColumn<Article>[] = [
    { key: 'title', label: 'Başlık', sortable: true, width: '40%' },
    { key: 'status', label: 'Durum', sortable: true, width: '10%' },
    { key: 'category', label: 'Kategori', sortable: false, width: '15%' },
    { key: 'author', label: 'Yazar', sortable: true, width: '15%' },
    { key: 'createdAt', label: 'Oluşturulma', sortable: true, width: '15%' },
  ];

  // State signals
  articles = signal<Article[]>([]);
  selectedArticles = signal<Article[]>([]);
  categories = signal<any[]>([]);
  loading = signal(true);
  bulkActionLoading = signal(false);
  totalCount = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  currentSort = signal<TableSort | null>(null);

  // Delete dialog state
  showDeleteDialog = signal(false);
  deleteDialogMessage = signal('');
  private articleToDelete: Article | null = null;
  private isBulkDelete = false;

  // Filters
  filters: ArticleFilters = {};

  constructor() {
    // Subscribe to service observables
    this.articleService.articles$.pipe(takeUntilDestroyed()).subscribe(articles => {
      this.articles.set(articles);
      this.loading.set(false);
    });

    this.articleService.totalCount$.pipe(takeUntilDestroyed()).subscribe(count => {
      this.totalCount.set(count);
      this.totalPages.set(Math.ceil(count / 20)); // 20 items per page
    });

    this.articleService.loading$.pipe(takeUntilDestroyed()).subscribe(loading => {
      this.loading.set(loading);
    });
  }

  ngOnInit(): void {
    this.loadArticles();
    this.loadCategories();
  }

  private loadArticles(): void {
    this.articleService.loadArticles({
      page: this.currentPage(),
      ...this.filters,
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

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadArticles();
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPage.set(1);
    this.loadArticles();
  }

  onSortChange(sort: TableSort): void {
    this.currentSort.set(sort);
    this.loadArticles();
  }

  onSelectChange(selected: Article[]): void {
    this.selectedArticles.set(selected);
  }

  viewArticle(article: Article): void {
    // Navigate to article detail or edit
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadArticles();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadArticles();
    }
  }

  confirmDelete(article: Article): void {
    this.articleToDelete = article;
    this.isBulkDelete = false;
    this.deleteDialogMessage.set(
      `"${article.title}" başlıklı makaleyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    this.showDeleteDialog.set(true);
  }

  confirmBulkDelete(): void {
    this.isBulkDelete = true;
    this.deleteDialogMessage.set(
      `${this.selectedArticles().length} makaleyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    this.showDeleteDialog.set(true);
  }

  handleDelete(): void {
    if (this.isBulkDelete) {
      this.bulkDelete();
    } else if (this.articleToDelete) {
      this.deleteArticle(this.articleToDelete);
    }
    this.showDeleteDialog.set(false);
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.articleToDelete = null;
    this.isBulkDelete = false;
  }

  private deleteArticle(article: Article): void {
    this.articleService.deleteArticle(article.id).subscribe({
      next: () => {
        this.loadArticles();
      },
    });
  }

  private bulkDelete(): void {
    this.bulkActionLoading.set(true);
    const ids = this.selectedArticles().map(a => a.id);

    this.articleService.bulkDeleteArticles(ids).subscribe({
      next: () => {
        this.selectedArticles.set([]);
        this.bulkActionLoading.set(false);
        this.loadArticles();
      },
      error: () => {
        this.bulkActionLoading.set(false);
      },
    });
  }

  bulkPublish(): void {
    this.bulkActionLoading.set(true);
    const ids = this.selectedArticles().map(a => a.id);

    this.articleService.bulkPublishArticles(ids).subscribe({
      next: () => {
        this.selectedArticles.set([]);
        this.bulkActionLoading.set(false);
        this.loadArticles();
      },
      error: () => {
        this.bulkActionLoading.set(false);
      },
    });
  }

  getStatusBadgeClass(status: string): string {
    const baseClass = 'inline-flex rounded-full px-2 py-1 text-xs font-semibold';
    const statusMap: Record<string, string> = {
      [ARTICLE_STATUS.DRAFT]: `${baseClass} bg-gray-100 text-gray-800`,
      [ARTICLE_STATUS.PUBLISHED]: `${baseClass} bg-green-100 text-green-800`,
      [ARTICLE_STATUS.ARCHIVED]: `${baseClass} bg-red-100 text-red-800`,
    };
    return statusMap[status] || baseClass;
  }

  getStatusLabel(status: string): string {
    const labelMap: Record<string, string> = {
      [ARTICLE_STATUS.DRAFT]: 'Taslak',
      [ARTICLE_STATUS.PUBLISHED]: 'Yayında',
      [ARTICLE_STATUS.ARCHIVED]: 'Arşiv',
    };
    return labelMap[status] || status;
  }
}
