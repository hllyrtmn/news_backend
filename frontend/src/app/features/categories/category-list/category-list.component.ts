/**
 * Category List Component (Smart)
 *
 * Displays list of categories with CRUD operations
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Services
import { CategoryService } from '../services/category.service';

// Components
import { TableComponent, TableColumn, TableSort } from '../../../shared/ui/table/table.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/ui/confirmation-dialog/confirmation-dialog.component';

// Types & Constants
import { Category } from '../../../shared/models/category.types';
import { ADMIN_ROUTES } from '../../../shared/constants/routes.constants';

@Component({
  selector: 'app-category-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    SpinnerComponent,
    ConfirmationDialogComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Kategoriler</h1>
          <p class="mt-1 text-sm text-gray-500">
            Toplam {{ totalCount() }} kategori
          </p>
        </div>
        <a
          [routerLink]="newCategoryRoute"
          class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Yeni Kategori
        </a>
      </div>

      <!-- Search -->
      <div class="rounded-lg bg-white p-4 shadow">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange()"
          placeholder="Kategori ara..."
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <!-- Categories Table -->
      <app-table
        [columns]="columns"
        [data]="categories()"
        [loading]="loading()"
        [hasActions]="true"
        [sort]="currentSort()"
        emptyText="Kategori bulunamadı"
        (sortChange)="onSortChange($event)"
        (rowClick)="editCategory($event)"
      >
        @for (category of categories(); track category.id) {
          <ng-container [attr.column-name]="category.id">
            <div class="flex items-center">
              @if (category.color) {
                <div
                  [style.background-color]="category.color"
                  class="mr-3 h-4 w-4 rounded-full"
                ></div>
              }
              <span class="font-medium text-gray-900">{{ category.name }}</span>
            </div>
          </ng-container>

          <ng-container [attr.column-slug]="category.id">
            <code class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
              {{ category.slug }}
            </code>
          </ng-container>

          <ng-container [attr.column-description]="category.id">
            @if (category.description) {
              <span class="text-sm text-gray-600">{{ category.description }}</span>
            } @else {
              <span class="text-sm text-gray-400">-</span>
            }
          </ng-container>

          <ng-container [attr.column-articleCount]="category.id">
            <span class="text-sm text-gray-900">{{ category.articleCount || 0 }}</span>
          </ng-container>

          <div actions>
            <div class="flex items-center space-x-3">
              <a
                [routerLink]="['/admin/categories', category.id, 'edit']"
                class="text-blue-600 hover:text-blue-700"
                (click)="$event.stopPropagation()"
              >
                Düzenle
              </a>
              <button
                (click)="confirmDelete(category); $event.stopPropagation()"
                class="text-red-600 hover:text-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        }
      </app-table>

      <!-- Delete Confirmation -->
      @if (showDeleteDialog()) {
        <app-confirmation-dialog
          title="Kategoriyi Sil"
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
export class CategoryListComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);

  protected readonly newCategoryRoute = `${ADMIN_ROUTES.categories}/new`;

  // Table configuration
  protected readonly columns: TableColumn<Category>[] = [
    { key: 'name', label: 'Ad', sortable: true, width: '30%' },
    { key: 'slug', label: 'Slug', sortable: true, width: '20%' },
    { key: 'description', label: 'Açıklama', sortable: false, width: '35%' },
    { key: 'articleCount', label: 'Makale Sayısı', sortable: true, width: '15%' },
  ];

  // State signals
  categories = signal<Category[]>([]);
  loading = signal(true);
  totalCount = signal(0);
  currentSort = signal<TableSort | null>(null);
  searchQuery = '';

  // Delete dialog
  showDeleteDialog = signal(false);
  deleteDialogMessage = signal('');
  private categoryToDelete: Category | null = null;

  constructor() {
    this.categoryService.categories$.pipe(takeUntilDestroyed()).subscribe(categories => {
      this.categories.set(categories);
      this.loading.set(false);
    });

    this.categoryService.totalCount$.pipe(takeUntilDestroyed()).subscribe(count => {
      this.totalCount.set(count);
    });

    this.categoryService.loading$.pipe(takeUntilDestroyed()).subscribe(loading => {
      this.loading.set(loading);
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoryService.loadCategories({
      search: this.searchQuery,
    });
  }

  onSearchChange(): void {
    this.loadCategories();
  }

  onSortChange(sort: TableSort): void {
    this.currentSort.set(sort);
    this.loadCategories();
  }

  editCategory(category: Category): void {
    // Navigate handled by routerLink
  }

  confirmDelete(category: Category): void {
    this.categoryToDelete = category;
    this.deleteDialogMessage.set(
      `"${category.name}" kategorisini silmek istediğinizden emin misiniz? Bu kategoriye ait ${category.articleCount || 0} makale kategorisiz kalacaktır.`
    );
    this.showDeleteDialog.set(true);
  }

  handleDelete(): void {
    if (this.categoryToDelete) {
      this.categoryService.deleteCategory(this.categoryToDelete.id).subscribe({
        next: () => {
          this.loadCategories();
        },
      });
    }
    this.showDeleteDialog.set(false);
    this.categoryToDelete = null;
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.categoryToDelete = null;
  }
}
