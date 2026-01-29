/**
 * User List Component (Smart)
 *
 * Displays list of users with filtering and management
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Services
import { UserService } from '../services/user.service';

// Components
import { TableComponent, TableColumn, TableSort } from '../../../shared/ui/table/table.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/ui/confirmation-dialog/confirmation-dialog.component';

// Pipes
import { DateAgoPipe } from '../../../shared/pipes/date-ago.pipe';

// Types & Constants
import { User } from '../../../shared/models/user.types';
import { ADMIN_ROUTES } from '../../../shared/constants/routes.constants';

interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-user-list',
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
    DateAgoPipe,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Kullanıcılar</h1>
          <p class="mt-1 text-sm text-gray-500">
            Toplam {{ totalCount() }} kullanıcı
          </p>
        </div>
        <a
          [routerLink]="newUserRoute"
          class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Yeni Kullanıcı
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
              placeholder="Ad, email, kullanıcı adı..."
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <!-- Role Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              [(ngModel)]="filters.role"
              (ngModelChange)="onFilterChange()"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tümü</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="author">Author</option>
              <option value="user">User</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Durum
            </label>
            <select
              [(ngModel)]="filters.isActive"
              (ngModelChange)="onFilterChange()"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option [value]="undefined">Tümü</option>
              <option [value]="true">Aktif</option>
              <option [value]="false">Pasif</option>
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

      <!-- Users Table -->
      <app-table
        [columns]="columns"
        [data]="users()"
        [loading]="loading()"
        [hasActions]="true"
        [sort]="currentSort()"
        emptyText="Kullanıcı bulunamadı"
        (sortChange)="onSortChange($event)"
        (rowClick)="viewUser($event)"
      >
        @for (user of users(); track user.id) {
          <ng-container [attr.column-fullName]="user.id">
            <div class="flex items-center">
              @if (user.avatar) {
                <img
                  [src]="user.avatar"
                  [alt]="user.fullName"
                  class="h-10 w-10 rounded-full"
                />
              } @else {
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                  {{ user.fullName.charAt(0).toUpperCase() }}
                </div>
              }
              <div class="ml-3">
                <p class="font-medium text-gray-900">{{ user.fullName }}</p>
                <p class="text-sm text-gray-500">&#64;{{ user.username }}</p>
              </div>
            </div>
          </ng-container>

          <ng-container [attr.column-email]="user.id">
            <a
              [href]="'mailto:' + user.email"
              class="text-sm text-blue-600 hover:text-blue-700"
              (click)="$event.stopPropagation()"
            >
              {{ user.email }}
            </a>
          </ng-container>

          <ng-container [attr.column-role]="user.id">
            <span [class]="getRoleBadgeClass(user.role || 'user')">
              {{ getRoleLabel(user.role || 'user') }}
            </span>
          </ng-container>

          <ng-container [attr.column-isActive]="user.id">
            <button
              (click)="toggleUserStatus(user); $event.stopPropagation()"
              [class]="getStatusBadgeClass(user.isActive)"
            >
              {{ user.isActive ? 'Aktif' : 'Pasif' }}
            </button>
          </ng-container>

          <ng-container [attr.column-lastLogin]="user.id">
            @if (user.lastLogin) {
              <span class="text-sm text-gray-500">{{ user.lastLogin | dateAgo }}</span>
            } @else {
              <span class="text-sm text-gray-400">Hiç giriş yapmadı</span>
            }
          </ng-container>

          <div actions>
            <div class="flex items-center space-x-3">
              <a
                [routerLink]="['/admin/users', user.id, 'edit']"
                class="text-blue-600 hover:text-blue-700"
                (click)="$event.stopPropagation()"
              >
                Düzenle
              </a>
              <button
                (click)="confirmDelete(user); $event.stopPropagation()"
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
          title="Kullanıcıyı Sil"
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
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);

  protected readonly newUserRoute = `${ADMIN_ROUTES.users}/new`;

  // Table configuration
  protected readonly columns: TableColumn<User>[] = [
    { key: 'fullName', label: 'Kullanıcı', sortable: true, width: '25%' },
    { key: 'email', label: 'E-posta', sortable: true, width: '20%' },
    { key: 'role', label: 'Rol', sortable: true, width: '15%' },
    { key: 'isActive', label: 'Durum', sortable: true, width: '10%' },
    { key: 'lastLogin', label: 'Son Giriş', sortable: true, width: '20%' },
  ];

  // State signals
  users = signal<User[]>([]);
  loading = signal(true);
  totalCount = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  currentSort = signal<TableSort | null>(null);

  // Delete dialog
  showDeleteDialog = signal(false);
  deleteDialogMessage = signal('');
  private userToDelete: User | null = null;

  // Filters
  filters: UserFilters = {};

  constructor() {
    this.userService.users$.pipe(takeUntilDestroyed()).subscribe(users => {
      this.users.set(users);
      this.loading.set(false);
    });

    this.userService.totalCount$.pipe(takeUntilDestroyed()).subscribe(count => {
      this.totalCount.set(count);
      this.totalPages.set(Math.ceil(count / 20));
    });

    this.userService.loading$.pipe(takeUntilDestroyed()).subscribe(loading => {
      this.loading.set(loading);
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.userService.loadUsers({
      page: this.currentPage(),
      ...this.filters,
    });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPage.set(1);
    this.loadUsers();
  }

  onSortChange(sort: TableSort): void {
    this.currentSort.set(sort);
    this.loadUsers();
  }

  viewUser(user: User): void {
    // Navigate handled by row click
  }

  toggleUserStatus(user: User): void {
    this.userService.toggleUserStatus(user.id, !user.isActive).subscribe({
      next: () => {
        this.loadUsers();
      },
    });
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadUsers();
    }
  }

  confirmDelete(user: User): void {
    this.userToDelete = user;
    this.deleteDialogMessage.set(
      `"${user.fullName}" kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    this.showDeleteDialog.set(true);
  }

  handleDelete(): void {
    if (this.userToDelete) {
      this.userService.deleteUser(this.userToDelete.id).subscribe({
        next: () => {
          this.loadUsers();
        },
      });
    }
    this.showDeleteDialog.set(false);
    this.userToDelete = null;
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.userToDelete = null;
  }

  getRoleBadgeClass(role: string): string {
    const baseClass = 'inline-flex rounded-full px-2 py-1 text-xs font-semibold';
    const roleMap: Record<string, string> = {
      admin: `${baseClass} bg-purple-100 text-purple-800`,
      editor: `${baseClass} bg-blue-100 text-blue-800`,
      author: `${baseClass} bg-green-100 text-green-800`,
      user: `${baseClass} bg-gray-100 text-gray-800`,
    };
    return roleMap[role] || baseClass;
  }

  getRoleLabel(role: string): string {
    const labelMap: Record<string, string> = {
      admin: 'Admin',
      editor: 'Editör',
      author: 'Yazar',
      user: 'Kullanıcı',
    };
    return labelMap[role] || role;
  }

  getStatusBadgeClass(isActive: boolean): string {
    const baseClass = 'inline-flex rounded-full px-2 py-1 text-xs font-semibold cursor-pointer transition-colors';
    return isActive
      ? `${baseClass} bg-green-100 text-green-800 hover:bg-green-200`
      : `${baseClass} bg-red-100 text-red-800 hover:bg-red-200`;
  }
}
