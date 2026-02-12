/**
 * User Detail Component (Smart)
 *
 * Displays detailed user information
 */

import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Services
import { UserService } from '../services/user.service';

// Components
import { CardComponent } from '../../../shared/ui/card/card.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

// Models
import { User } from '../../../shared/models/user.types';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    SpinnerComponent,
    DatePipe,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Kullanıcı Detayları</h1>
          <p class="mt-1 text-sm text-gray-500">
            Kullanıcı bilgilerini görüntüle
          </p>
        </div>
        <div class="flex space-x-3">
          <a
            routerLink="/admin/users"
            class="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Geri Dön
          </a>
          @if (user()) {
            <a
              [routerLink]="['/admin/users', user()!.id, 'edit']"
              class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Düzenle
            </a>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <app-spinner size="lg"></app-spinner>
        </div>
      }
      @if (!loading() && user()) {
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Basic Info -->
            <app-card>
              <div header class="font-semibold text-gray-900">Temel Bilgiler</div>
              <div body class="space-y-4">
                <div class="flex items-center space-x-4">
                  @if (user()!.avatar) {
                    <img
                      [src]="user()!.avatar"
                      [alt]="user()!.fullName"
                      class="h-20 w-20 rounded-full object-cover"
                    />
                  } @else {
                    <div class="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                      <span class="text-2xl font-medium text-blue-600">
                        {{ getUserInitials(user()!.fullName) }}
                      </span>
                    </div>
                  }
                  <div>
                    <h2 class="text-xl font-bold text-gray-900">{{ user()!.fullName }}</h2>
                    <p class="text-sm text-gray-500">&#64;{{ user()!.username }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-500">Email</label>
                    <p class="mt-1 text-sm text-gray-900">{{ user()!.email }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-500">Kullanıcı Adı</label>
                    <p class="mt-1 text-sm text-gray-900">{{ user()!.username }}</p>
                  </div>
                  @if (user()!.firstName) {
                    <div>
                      <label class="text-sm font-medium text-gray-500">Ad</label>
                      <p class="mt-1 text-sm text-gray-900">{{ user()!.firstName }}</p>
                    </div>
                  }
                  @if (user()!.lastName) {
                    <div>
                      <label class="text-sm font-medium text-gray-500">Soyad</label>
                      <p class="mt-1 text-sm text-gray-900">{{ user()!.lastName }}</p>
                    </div>
                  }
                </div>

                @if (user()!.bio) {
                  <div>
                    <label class="text-sm font-medium text-gray-500">Biyografi</label>
                    <p class="mt-1 text-sm text-gray-700">{{ user()!.bio }}</p>
                  </div>
                }
              </div>
            </app-card>

            <!-- Permissions -->
            <app-card>
              <div header class="font-semibold text-gray-900">Yetkiler ve İzinler</div>
              <div body>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-700">Rol</span>
                    <span [class]="getRoleBadgeClass(user()!.role)" class="rounded-full px-3 py-1 text-xs font-medium">
                      {{ getRoleLabel(user()!.role) }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-700">Durum</span>
                    <span [class]="user()!.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="rounded-full px-3 py-1 text-xs font-medium">
                      {{ user()!.isActive ? 'Aktif' : 'Pasif' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-700">Personel</span>
                    <span class="text-sm text-gray-900">{{ user()!.isStaff ? 'Evet' : 'Hayır' }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-700">Süper Kullanıcı</span>
                    <span class="text-sm text-gray-900">{{ user()!.isSuperuser ? 'Evet' : 'Hayır' }}</span>
                  </div>
                </div>
              </div>
            </app-card>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Activity Info -->
            <app-card>
              <div header class="font-semibold text-gray-900">Aktivite Bilgileri</div>
              <div body class="space-y-3">
                <div>
                  <label class="text-sm font-medium text-gray-500">Kayıt Tarihi</label>
                  <p class="mt-1 text-sm text-gray-900">
                    {{ user()!.dateJoined | date:'dd MMMM yyyy HH:mm' }}
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Son Giriş</label>
                  @if (user()!.lastLogin) {
                    <p class="mt-1 text-sm text-gray-900">
                      {{ user()!.lastLogin | date:'dd MMMM yyyy HH:mm' }}
                    </p>
                  } @else {
                    <p class="mt-1 text-sm text-gray-400">Hiç giriş yapmadı</p>
                  }
                </div>
              </div>
            </app-card>

            <!-- Quick Actions -->
            <app-card>
              <div header class="font-semibold text-gray-900">Hızlı İşlemler</div>
              <div body class="space-y-2">
                <a
                  [routerLink]="['/admin/users', user()!.id, 'edit']"
                  class="block w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Düzenle
                </a>
                @if (user()!.isActive) {
                  <button
                    class="block w-full rounded-lg border border-red-300 px-4 py-2 text-center text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                  >
                    Devre Dışı Bırak
                  </button>
                } @else {
                  <button
                    class="block w-full rounded-lg border border-green-300 px-4 py-2 text-center text-sm font-medium text-green-700 hover:bg-green-50 transition-colors"
                  >
                    Aktif Et
                  </button>
                }
              </div>
            </app-card>
          </div>
        </div>
      }
      @if (!loading() && !user()) {
        <div class="rounded-lg bg-white p-12 text-center shadow">
          <h3 class="text-sm font-medium text-gray-900">Kullanıcı bulunamadı</h3>
          <p class="mt-1 text-sm text-gray-500">Aradığınız kullanıcı bulunamadı.</p>
        </div>
      }
    </div>
  `
})
export class UserDetailComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);

  // State signals
  user = signal<User | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(+id);
    } else {
      this.loading.set(false);
    }
  }

  private loadUser(id: number): void {
    this.userService
      .getUser(id)
      .pipe(takeUntilDestroyed())
      .subscribe(user => {
        this.user.set(user);
        this.loading.set(false);
      });
  }

  getUserInitials(fullName: string): string {
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Yönetici',
      editor: 'Editör',
      author: 'Yazar',
      user: 'Kullanıcı',
    };
    return labels[role] || role;
  }

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      editor: 'bg-blue-100 text-blue-800',
      author: 'bg-green-100 text-green-800',
      user: 'bg-gray-100 text-gray-800',
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
  }
}
