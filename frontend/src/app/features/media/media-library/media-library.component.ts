/**
 * Media Library Component (Smart)
 *
 * Displays media library with grid view and management operations
 */

import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Services
import { MediaService, MediaItem } from '../../../shared/services/media.service';

// Components
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/ui/confirmation-dialog/confirmation-dialog.component';

// Helpers
import { NotificationHelper } from '../../../shared/helpers/notification.helper';

@Component({
  selector: 'app-media-library',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonComponent,
    SpinnerComponent,
    ConfirmationDialogComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Medya Kütüphanesi</h1>
          <p class="mt-1 text-sm text-gray-500">
            Toplam {{ totalCount() }} medya dosyası
          </p>
        </div>
        <a
          routerLink="/admin/media/upload"
          class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Medya Yükle
        </a>
      </div>

      <!-- Filters -->
      <div class="rounded-lg bg-white p-4 shadow">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <!-- Search -->
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Medya ara..."
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <!-- File Type Filter -->
          <select
            [(ngModel)]="filterType"
            (ngModelChange)="onFilterChange()"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tüm Dosya Tipleri</option>
            <option value="image">Görsel</option>
            <option value="video">Video</option>
            <option value="audio">Ses</option>
            <option value="document">Doküman</option>
          </select>

          <!-- Processing Status Filter -->
          <select
            [(ngModel)]="filterStatus"
            (ngModelChange)="onFilterChange()"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tüm Durumlar</option>
            <option value="completed">Tamamlandı</option>
            <option value="processing">İşleniyor</option>
            <option value="pending">Bekliyor</option>
            <option value="failed">Başarısız</option>
          </select>
        </div>
      </div>

      <!-- Media Grid -->
      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <app-spinner size="lg"></app-spinner>
        </div>
      } @else if (mediaItems().length === 0) {
        <div class="rounded-lg bg-white p-12 text-center shadow">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Medya bulunamadı</h3>
          <p class="mt-1 text-sm text-gray-500">Yeni medya yükleyerek başlayın.</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          @for (item of mediaItems(); track item.id) {
            <div class="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
              <!-- Media Preview -->
              <div class="aspect-square overflow-hidden bg-gray-100">
                @if (item.file_type === 'image') {
                  <img
                    [src]="item.thumbnail || item.file"
                    [alt]="item.alt_text"
                    class="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                } @else {
                  <div class="flex h-full items-center justify-center">
                    <svg class="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                }
              </div>

              <!-- Info -->
              <div class="p-3">
                <h3 class="truncate text-sm font-medium text-gray-900" [title]="item.title">
                  {{ item.title }}
                </h3>
                <p class="mt-1 text-xs text-gray-500">
                  {{ getFileSize(item.file_size) }} • {{ item.file_type }}
                </p>

                <!-- Status Badge -->
                @if (item.processing_status !== 'completed') {
                  <span
                    [class]="getStatusBadgeClass(item.processing_status)"
                    class="mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium"
                  >
                    {{ getStatusLabel(item.processing_status) }}
                  </span>
                }
              </div>

              <!-- Actions Overlay -->
              <div class="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  (click)="viewMedia(item)"
                  class="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
                >
                  Görüntüle
                </button>
                <button
                  (click)="confirmDelete(item)"
                  class="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Sil
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-center space-x-2">
            <button
              (click)="previousPage()"
              [disabled]="currentPage() === 1"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Önceki
            </button>
            <span class="text-sm text-gray-600">
              Sayfa {{ currentPage() }} / {{ totalPages() }}
            </span>
            <button
              (click)="nextPage()"
              [disabled]="currentPage() === totalPages()"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sonraki →
            </button>
          </div>
        }
      }

      <!-- Delete Confirmation -->
      @if (showDeleteDialog()) {
        <app-confirmation-dialog
          title="Medyayı Sil"
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
export class MediaLibraryComponent implements OnInit {
  private readonly mediaService = inject(MediaService);

  // State signals
  mediaItems = signal<MediaItem[]>([]);
  loading = signal(true);
  totalCount = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  searchQuery = '';
  filterType = '';
  filterStatus = '';

  // Delete dialog
  showDeleteDialog = signal(false);
  deleteDialogMessage = signal('');
  private mediaToDelete: MediaItem | null = null;

  ngOnInit(): void {
    this.loadMedia();
  }

  private loadMedia(): void {
    this.loading.set(true);

    const params: any = {
      page: this.currentPage(),
      page_size: 20,
    };

    if (this.filterType) params.file_type = this.filterType;
    if (this.filterStatus) params.processing_status = this.filterStatus;

    this.mediaService.getMediaList(params).subscribe({
      next: response => {
        this.mediaItems.set(response.results);
        this.totalCount.set(response.count);
        this.totalPages.set(Math.ceil(response.count / 20));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        NotificationHelper.showError('Medya dosyaları yüklenemedi');
      },
    });
  }

  onSearchChange(): void {
    this.currentPage.set(1);
    this.loadMedia();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadMedia();
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadMedia();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadMedia();
    }
  }

  viewMedia(item: MediaItem): void {
    window.open(item.file, '_blank');
  }

  confirmDelete(item: MediaItem): void {
    this.mediaToDelete = item;
    this.deleteDialogMessage.set(
      `"${item.title}" medya dosyasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    this.showDeleteDialog.set(true);
  }

  handleDelete(): void {
    if (this.mediaToDelete) {
      this.mediaService.deleteMedia(this.mediaToDelete.id).subscribe({
        next: () => {
          NotificationHelper.showSuccess('Medya dosyası başarıyla silindi');
          this.loadMedia();
        },
        error: () => {
          NotificationHelper.showError('Medya dosyası silinemedi');
        },
      });
    }
    this.showDeleteDialog.set(false);
    this.mediaToDelete = null;
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.mediaToDelete = null;
  }

  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Bekliyor',
      processing: 'İşleniyor',
      completed: 'Tamamlandı',
      failed: 'Başarısız',
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
