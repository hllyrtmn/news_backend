/**
 * Comment List Component (Smart)
 *
 * Displays comments with moderation actions
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Services
import { CommentService } from '../services/comment.service';

// Components
import { TableComponent, TableColumn, TableSort } from '../../../shared/ui/table/table.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/ui/confirmation-dialog/confirmation-dialog.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';

// Pipes
import { DateAgoPipe } from '../../../shared/pipes/date-ago.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

// Types & Constants
import { Comment, CommentStatus } from '../../../shared/models/comment.types';

interface CommentFilters {
  search?: string;
  status?: CommentStatus | '';
  articleId?: number;
}

@Component({
  selector: 'app-comment-list',
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
    ModalComponent,
    DateAgoPipe,
    TruncatePipe,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Yorumlar</h1>
          <p class="mt-1 text-sm text-gray-500">
            Toplam {{ totalCount() }} yorum
            @if (pendingCount() > 0) {
              <span class="ml-2 rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800">
                {{ pendingCount() }} beklemede
              </span>
            }
          </p>
        </div>
        <button
          (click)="loadPendingComments()"
          class="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Bekleyen Yorumlar
        </button>
      </div>

      <!-- Filters -->
      <div class="rounded-lg bg-white p-4 shadow">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Ara
            </label>
            <input
              type="text"
              [(ngModel)]="filters.search"
              (ngModelChange)="onFilterChange()"
              placeholder="İçerik, yazar..."
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
              <option value="pending">Beklemede</option>
              <option value="approved">Onaylandı</option>
              <option value="rejected">Reddedildi</option>
              <option value="spam">Spam</option>
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
      @if (selectedComments().length > 0) {
        <div class="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-blue-900">
              {{ selectedComments().length }} yorum seçildi
            </span>
            <div class="flex items-center space-x-3">
              <button
                (click)="bulkApprove()"
                [disabled]="bulkActionLoading()"
                class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Onayla
              </button>
              <button
                (click)="bulkReject()"
                [disabled]="bulkActionLoading()"
                class="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50 transition-colors"
              >
                Reddet
              </button>
              <button
                (click)="bulkMarkAsSpam()"
                [disabled]="bulkActionLoading()"
                class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Spam
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Comments Table -->
      <app-table
        [columns]="columns"
        [data]="comments()"
        [loading]="loading()"
        [selectable]="true"
        [selectedRows]="selectedComments()"
        [hasActions]="true"
        [sort]="currentSort()"
        emptyText="Yorum bulunamadı"
        (sortChange)="onSortChange($event)"
        (selectChange)="onSelectChange($event)"
        (rowClick)="viewComment($event)"
      >
        @for (comment of comments(); track comment.id) {
          <ng-container [attr.column-content]="comment.id">
            <div>
              <p class="text-sm text-gray-900">{{ comment.content | truncate: 100 }}</p>
              <div class="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                <span>{{ comment.author.fullName }}</span>
                <span>•</span>
                <a
                  [routerLink]="['/admin/articles', comment.article.id]"
                  class="text-blue-600 hover:text-blue-700"
                  (click)="$event.stopPropagation()"
                >
                  {{ comment.article.title | truncate: 40 }}
                </a>
              </div>
            </div>
          </ng-container>

          <ng-container [attr.column-status]="comment.id">
            <span [class]="getStatusBadgeClass(comment.status)">
              {{ getStatusLabel(comment.status) }}
            </span>
          </ng-container>

          <ng-container [attr.column-createdAt]="comment.id">
            <span class="text-sm text-gray-500">{{ comment.createdAt | dateAgo }}</span>
          </ng-container>

          <div actions>
            <div class="flex items-center space-x-2">
              @if (comment.status === 'pending') {
                <button
                  (click)="approveComment(comment); $event.stopPropagation()"
                  class="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
                  title="Onayla"
                >
                  Onayla
                </button>
                <button
                  (click)="rejectComment(comment); $event.stopPropagation()"
                  class="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-200"
                  title="Reddet"
                >
                  Reddet
                </button>
                <button
                  (click)="markAsSpam(comment); $event.stopPropagation()"
                  class="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                  title="Spam"
                >
                  Spam
                </button>
              } @else {
                <button
                  (click)="viewComment(comment); $event.stopPropagation()"
                  class="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Görüntüle
                </button>
              }
              <button
                (click)="confirmDelete(comment); $event.stopPropagation()"
                class="text-red-600 hover:text-red-700 text-sm"
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

      <!-- Comment Detail Modal -->
      @if (showDetailModal() && selectedComment()) {
        <app-modal
          [title]="'Yorum Detayı'"
          (close)="closeDetailModal()"
        >
          <div class="space-y-4">
            <!-- Content -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-2">İçerik</h3>
              <p class="text-sm text-gray-900">{{ selectedComment()!.content }}</p>
            </div>

            <!-- Author -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-2">Yazar</h3>
              <div class="flex items-center">
                @if (selectedComment()!.author.avatar) {
                  <img
                    [src]="selectedComment()!.author.avatar"
                    [alt]="selectedComment()!.author.fullName"
                    class="h-10 w-10 rounded-full"
                  />
                } @else {
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium">
                    {{ selectedComment()!.author.fullName.charAt(0).toUpperCase() }}
                  </div>
                }
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">{{ selectedComment()!.author.fullName }}</p>
                  <p class="text-xs text-gray-500">&#64;{{ selectedComment()!.author.username }}</p>
                </div>
              </div>
            </div>

            <!-- Article -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-2">Makale</h3>
              <a
                [routerLink]="['/admin/articles', selectedComment()!.article.id]"
                class="text-sm text-blue-600 hover:text-blue-700"
              >
                {{ selectedComment()!.article.title }}
              </a>
            </div>

            <!-- Status -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-2">Durum</h3>
              <span [class]="getStatusBadgeClass(selectedComment()!.status)">
                {{ getStatusLabel(selectedComment()!.status) }}
              </span>
            </div>

            <!-- Moderation Info -->
            @if (selectedComment()!.moderatedBy) {
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-2">Moderasyon</h3>
                <p class="text-sm text-gray-900">
                  <strong>Moderatör:</strong> {{ selectedComment()!.moderatedBy!.fullName }}
                </p>
                <p class="text-sm text-gray-900">
                  <strong>Tarih:</strong> {{ selectedComment()!.moderatedAt | dateAgo }}
                </p>
                @if (selectedComment()!.moderationNote) {
                  <p class="text-sm text-gray-900">
                    <strong>Not:</strong> {{ selectedComment()!.moderationNote }}
                  </p>
                }
              </div>
            }

            <!-- Dates -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-2">Tarihler</h3>
              <p class="text-xs text-gray-500">
                <strong>Oluşturulma:</strong> {{ selectedComment()!.createdAt | dateAgo }}
              </p>
              <p class="text-xs text-gray-500">
                <strong>Güncellenme:</strong> {{ selectedComment()!.updatedAt | dateAgo }}
              </p>
            </div>
          </div>
        </app-modal>
      }

      <!-- Delete Confirmation Dialog -->
      @if (showDeleteDialog()) {
        <app-confirmation-dialog
          title="Yorumu Sil"
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
export class CommentListComponent implements OnInit {
  private readonly commentService = inject(CommentService);

  // Table configuration
  protected readonly columns: TableColumn<Comment>[] = [
    { key: 'content', label: 'Yorum', sortable: false, width: '50%' },
    { key: 'status', label: 'Durum', sortable: true, width: '15%' },
    { key: 'createdAt', label: 'Tarih', sortable: true, width: '20%' },
  ];

  // State signals
  comments = signal<Comment[]>([]);
  selectedComments = signal<Comment[]>([]);
  selectedComment = signal<Comment | null>(null);
  loading = signal(true);
  bulkActionLoading = signal(false);
  totalCount = signal(0);
  pendingCount = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  currentSort = signal<TableSort | null>(null);

  // Modal state
  showDetailModal = signal(false);

  // Delete dialog state
  showDeleteDialog = signal(false);
  deleteDialogMessage = signal('');
  private commentToDelete: Comment | null = null;

  // Filters
  filters: CommentFilters = {};

  constructor() {
    this.commentService.comments$.pipe(takeUntilDestroyed()).subscribe(comments => {
      this.comments.set(comments);
      this.pendingCount.set(comments.filter(c => c.status === 'pending').length);
      this.loading.set(false);
    });

    this.commentService.totalCount$.pipe(takeUntilDestroyed()).subscribe(count => {
      this.totalCount.set(count);
      this.totalPages.set(Math.ceil(count / 20));
    });

    this.commentService.loading$.pipe(takeUntilDestroyed()).subscribe(loading => {
      this.loading.set(loading);
    });
  }

  ngOnInit(): void {
    this.loadComments();
  }

  private loadComments(): void {
    this.commentService.loadComments({
      page: this.currentPage(),
      ...this.filters,
    });
  }

  loadPendingComments(): void {
    this.filters.status = 'pending';
    this.currentPage.set(1);
    this.loadComments();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadComments();
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPage.set(1);
    this.loadComments();
  }

  onSortChange(sort: TableSort): void {
    this.currentSort.set(sort);
    this.loadComments();
  }

  onSelectChange(selected: Comment[]): void {
    this.selectedComments.set(selected);
  }

  viewComment(comment: Comment): void {
    this.selectedComment.set(comment);
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedComment.set(null);
  }

  approveComment(comment: Comment): void {
    this.commentService.approveComment(comment.id).subscribe({
      next: () => {
        this.loadComments();
      },
    });
  }

  rejectComment(comment: Comment): void {
    this.commentService.rejectComment(comment.id).subscribe({
      next: () => {
        this.loadComments();
      },
    });
  }

  markAsSpam(comment: Comment): void {
    this.commentService.markAsSpam(comment.id).subscribe({
      next: () => {
        this.loadComments();
      },
    });
  }

  bulkApprove(): void {
    this.bulkActionLoading.set(true);
    const ids = this.selectedComments().map(c => c.id);

    this.commentService.bulkModerate(ids, { status: 'approved' }).subscribe({
      next: () => {
        this.selectedComments.set([]);
        this.bulkActionLoading.set(false);
        this.loadComments();
      },
      error: () => {
        this.bulkActionLoading.set(false);
      },
    });
  }

  bulkReject(): void {
    this.bulkActionLoading.set(true);
    const ids = this.selectedComments().map(c => c.id);

    this.commentService.bulkModerate(ids, { status: 'rejected' }).subscribe({
      next: () => {
        this.selectedComments.set([]);
        this.bulkActionLoading.set(false);
        this.loadComments();
      },
      error: () => {
        this.bulkActionLoading.set(false);
      },
    });
  }

  bulkMarkAsSpam(): void {
    this.bulkActionLoading.set(true);
    const ids = this.selectedComments().map(c => c.id);

    this.commentService.bulkModerate(ids, { status: 'spam' }).subscribe({
      next: () => {
        this.selectedComments.set([]);
        this.bulkActionLoading.set(false);
        this.loadComments();
      },
      error: () => {
        this.bulkActionLoading.set(false);
      },
    });
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadComments();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadComments();
    }
  }

  confirmDelete(comment: Comment): void {
    this.commentToDelete = comment;
    this.deleteDialogMessage.set(
      `Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    this.showDeleteDialog.set(true);
  }

  handleDelete(): void {
    if (this.commentToDelete) {
      this.commentService.deleteComment(this.commentToDelete.id).subscribe({
        next: () => {
          this.loadComments();
        },
      });
    }
    this.showDeleteDialog.set(false);
    this.commentToDelete = null;
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.commentToDelete = null;
  }

  getStatusBadgeClass(status: CommentStatus): string {
    const baseClass = 'inline-flex rounded-full px-2 py-1 text-xs font-semibold';
    const statusMap: Record<CommentStatus, string> = {
      pending: `${baseClass} bg-orange-100 text-orange-800`,
      approved: `${baseClass} bg-green-100 text-green-800`,
      rejected: `${baseClass} bg-yellow-100 text-yellow-800`,
      spam: `${baseClass} bg-red-100 text-red-800`,
    };
    return statusMap[status];
  }

  getStatusLabel(status: CommentStatus): string {
    const labelMap: Record<CommentStatus, string> = {
      pending: 'Beklemede',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      spam: 'Spam',
    };
    return labelMap[status];
  }
}
