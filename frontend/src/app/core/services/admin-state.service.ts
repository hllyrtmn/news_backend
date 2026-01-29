/**
 * Admin State Service
 *
 * Global admin panel state management using Signals
 * Manages sidebar, notifications, and global UI state
 */

import { Injectable, signal, computed } from '@angular/core';
import { StorageHelper } from '../../shared/helpers/storage.helper';

interface Breadcrumb {
  label: string;
  url?: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminStateService {
  private readonly SIDEBAR_KEY = 'sidebar_collapsed';

  // Sidebar State
  private _sidebarCollapsed = signal<boolean>(false);
  sidebarCollapsed = this._sidebarCollapsed.asReadonly();

  // Breadcrumbs
  private _breadcrumbs = signal<Breadcrumb[]>([]);
  breadcrumbs = this._breadcrumbs.asReadonly();

  // Toast Notifications
  private _toasts = signal<Toast[]>([]);
  toasts = this._toasts.asReadonly();

  // Loading State
  private _isGlobalLoading = signal<boolean>(false);
  isGlobalLoading = this._isGlobalLoading.asReadonly();

  // Modal State
  private _isModalOpen = signal<boolean>(false);
  isModalOpen = this._isModalOpen.asReadonly();

  // Computed
  sidebarWidth = computed(() => (this.sidebarCollapsed() ? '64px' : '256px'));
  hasToasts = computed(() => this.toasts().length > 0);

  constructor() {
    this.initSidebarState();
  }

  /**
   * Initialize sidebar state from storage
   */
  private initSidebarState(): void {
    const savedState = StorageHelper.get<boolean>(this.SIDEBAR_KEY);
    if (savedState !== null) {
      this._sidebarCollapsed.set(savedState);
    }
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar(): void {
    const newState = !this._sidebarCollapsed();
    this._sidebarCollapsed.set(newState);
    StorageHelper.set(this.SIDEBAR_KEY, newState);
  }

  /**
   * Collapse sidebar
   */
  collapseSidebar(): void {
    this._sidebarCollapsed.set(true);
    StorageHelper.set(this.SIDEBAR_KEY, true);
  }

  /**
   * Expand sidebar
   */
  expandSidebar(): void {
    this._sidebarCollapsed.set(false);
    StorageHelper.set(this.SIDEBAR_KEY, false);
  }

  /**
   * Set breadcrumbs
   */
  setBreadcrumbs(breadcrumbs: Breadcrumb[]): void {
    this._breadcrumbs.set(breadcrumbs);
  }

  /**
   * Clear breadcrumbs
   */
  clearBreadcrumbs(): void {
    this._breadcrumbs.set([]);
  }

  /**
   * Show toast notification
   */
  showToast(
    message: string,
    type: Toast['type'] = 'info',
    duration: number = 3000
  ): void {
    const id = Date.now();
    const toast: Toast = { id, message, type, duration };

    this._toasts.update(toasts => [...toasts, toast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }
  }

  /**
   * Show success toast
   */
  showSuccess(message: string, duration?: number): void {
    this.showToast(message, 'success', duration);
  }

  /**
   * Show error toast
   */
  showError(message: string, duration?: number): void {
    this.showToast(message, 'error', duration || 5000);
  }

  /**
   * Show warning toast
   */
  showWarning(message: string, duration?: number): void {
    this.showToast(message, 'warning', duration);
  }

  /**
   * Show info toast
   */
  showInfo(message: string, duration?: number): void {
    this.showToast(message, 'info', duration);
  }

  /**
   * Remove toast
   */
  removeToast(id: number): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  /**
   * Clear all toasts
   */
  clearToasts(): void {
    this._toasts.set([]);
  }

  /**
   * Set global loading state
   */
  setGlobalLoading(loading: boolean): void {
    this._isGlobalLoading.set(loading);
  }

  /**
   * Open modal
   */
  openModal(): void {
    this._isModalOpen.set(true);
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this._isModalOpen.set(false);
  }
}
