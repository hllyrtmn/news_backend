/**
 * Tag List Component (Smart)
 *
 * Displays list of tags with CRUD operations
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Services
import { AdminTagService, Tag } from '../services/tag.service';

// Components
import { TableComponent, TableColumn, TableSort } from '../../../shared/ui/table/table.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/ui/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-tag-list',
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
          <h1 class="text-2xl font-bold text-gray-900">Etiketler</h1>
          <p class="mt-1 text-sm text-gray-500">
            Toplam {{ totalCount() }} etiket
          </p>
        </div>
        <a
          routerLink="/admin/tags/new"
          class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Yeni Etiket
        </a>
      </div>

      <!-- Search -->
      <div class="rounded-lg bg-white p-4 shadow">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange()"
          placeholder="Etiket ara..."
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <!-- Tags Table -->
      <app-table
        [columns]="columns"
        [data]="tags()"
        [loading]="loading()"
        [hasActions]="true"
        [sort]="currentSort()"
        emptyText="Etiket bulunamadı"
        (sortChange)="onSortChange($event)"
        (rowClick)="editTag($event)"
      >
        @for (tag of tags(); track tag.id) {
          <ng-container [attr.column-name]="tag.id">
            <span class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              <svg class="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
              </svg>
              {{ tag.name }}
            </span>
          </ng-container>

          <ng-container [attr.column-slug]="tag.id">
            <code class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
              {{ tag.slug }}
            </code>
          </ng-container>

          <ng-container [attr.column-articleCount]="tag.id">
            <span class="text-sm text-gray-900">{{ tag.articleCount || 0 }}</span>
          </ng-container>

          <div actions>
            <div class="flex items-center space-x-3">
              <a
                [routerLink]="['/admin/tags', tag.id, 'edit']"
                class="text-blue-600 hover:text-blue-700"
                (click)="$event.stopPropagation()"
              >
                Düzenle
              </a>
              <button
                (click)="confirmDelete(tag); $event.stopPropagation()"
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
          title="Etiketi Sil"
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
export class TagListComponent implements OnInit {
  private readonly tagService = inject(AdminTagService);

  // Table configuration
  protected readonly columns: TableColumn<Tag>[] = [
    { key: 'name', label: 'Ad', sortable: true, width: '40%' },
    { key: 'slug', label: 'Slug', sortable: true, width: '35%' },
    { key: 'articleCount', label: 'Makale Sayısı', sortable: true, width: '25%' },
  ];

  // State signals
  tags = signal<Tag[]>([]);
  loading = signal(true);
  totalCount = signal(0);
  currentSort = signal<TableSort | null>(null);
  searchQuery = '';

  // Delete dialog
  showDeleteDialog = signal(false);
  deleteDialogMessage = signal('');
  private tagToDelete: Tag | null = null;

  constructor() {
    this.tagService.tags$.pipe(takeUntilDestroyed()).subscribe(tags => {
      this.tags.set(tags);
      this.loading.set(false);
    });

    this.tagService.totalCount$.pipe(takeUntilDestroyed()).subscribe(count => {
      this.totalCount.set(count);
    });

    this.tagService.loading$.pipe(takeUntilDestroyed()).subscribe(loading => {
      this.loading.set(loading);
    });
  }

  ngOnInit(): void {
    this.loadTags();
  }

  private loadTags(): void {
    this.tagService.loadTags({
      search: this.searchQuery,
    });
  }

  onSearchChange(): void {
    this.loadTags();
  }

  onSortChange(sort: TableSort): void {
    this.currentSort.set(sort);
    this.loadTags();
  }

  editTag(tag: Tag): void {
    // Navigate handled by routerLink
  }

  confirmDelete(tag: Tag): void {
    this.tagToDelete = tag;
    this.deleteDialogMessage.set(
      `"${tag.name}" etiketini silmek istediğinizden emin misiniz? Bu etikete ait ${tag.articleCount || 0} makale etkilenecektir.`
    );
    this.showDeleteDialog.set(true);
  }

  handleDelete(): void {
    if (this.tagToDelete) {
      this.tagService.deleteTag(this.tagToDelete.id).subscribe({
        next: () => {
          this.loadTags();
        },
      });
    }
    this.showDeleteDialog.set(false);
    this.tagToDelete = null;
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.tagToDelete = null;
  }
}
