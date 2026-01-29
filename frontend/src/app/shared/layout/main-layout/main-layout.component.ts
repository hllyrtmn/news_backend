/**
 * Main Layout Component (Smart)
 *
 * Combines Sidebar + Header + Main content area
 */

import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <app-sidebar />

      <!-- Main Content Area -->
      <div [class]="mainClasses()" class="flex flex-1 flex-col transition-all duration-300">
        <!-- Header -->
        <app-header />

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet></router-outlet>
        </main>

        <!-- Footer -->
        <footer class="border-t border-gray-200 bg-white px-6 py-4">
          <div class="flex items-center justify-between text-sm text-gray-600">
            <p>&copy; {{ currentYear }} Haber Admin. Tüm hakları saklıdır.</p>
            <div class="flex items-center gap-4">
              <a href="#" class="hover:text-gray-900 transition-colors">Yardım</a>
              <a href="#" class="hover:text-gray-900 transition-colors">Gizlilik</a>
              <a href="#" class="hover:text-gray-900 transition-colors">Şartlar</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  // Signals
  sidebarCollapsed = signal<boolean>(false);

  // Computed
  mainClasses = computed(() => {
    // Adjust margin based on sidebar state
    // In a real implementation, this would sync with sidebar component state
    return 'ml-64'; // or 'ml-16' when collapsed
  });

  currentYear = new Date().getFullYear();
}
