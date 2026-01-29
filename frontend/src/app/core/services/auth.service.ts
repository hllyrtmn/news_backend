/**
 * Auth Service
 *
 * Handles authentication logic (login, logout, token management)
 * Uses Signals + RxJS hybrid pattern (RxJS private, Signals public)
 */

import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpService } from './http.service';
import { StorageHelper } from '../../shared/helpers/storage.helper';
import { APP_CONFIG, USER_ROLES } from '../../shared/constants/app.constants';
import { API_ENDPOINTS } from '../../shared/constants/api.constants';
import { AUTH_ROUTES, ADMIN_ROUTES } from '../../shared/constants/routes.constants';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

interface RegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Private Signals (internal state)
  private _currentUser = signal<User | null>(null);
  private _isAuthenticated = signal<boolean>(false);

  // Public Signals (read-only computed)
  currentUser = this._currentUser.asReadonly();
  isAuthenticated = this._isAuthenticated.asReadonly();

  // Computed Signals
  userRole = computed(() => this.currentUser()?.role || '');
  isAdmin = computed(() => this.userRole() === USER_ROLES.ADMIN);
  isEditor = computed(() =>
    [USER_ROLES.ADMIN, USER_ROLES.EDITOR].includes(this.userRole())
  );
  isAuthor = computed(() =>
    [USER_ROLES.ADMIN, USER_ROLES.EDITOR, USER_ROLES.AUTHOR].includes(this.userRole())
  );

  constructor() {
    this.initAuth();
  }

  /**
   * Initialize authentication state from storage
   */
  private initAuth(): void {
    const token = StorageHelper.get<string>(APP_CONFIG.storageKeys.token);
    const user = StorageHelper.get<User>(APP_CONFIG.storageKeys.user);

    if (token && user) {
      this._isAuthenticated.set(true);
      this._currentUser.set(user);
    }
  }

  /**
   * Login
   */
  login(credentials: LoginRequest): void {
    this.http
      .post<LoginResponse>(API_ENDPOINTS.auth.login, credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.handleLoginSuccess(response);
        },
        error: error => {
          console.error('Login failed:', error);
        },
      });
  }

  /**
   * Register
   */
  register(data: RegisterRequest): void {
    this.http
      .post<LoginResponse>(API_ENDPOINTS.auth.register, data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.handleLoginSuccess(response);
        },
        error: error => {
          console.error('Registration failed:', error);
        },
      });
  }

  /**
   * Logout
   */
  logout(): void {
    // Clear storage
    StorageHelper.remove(APP_CONFIG.storageKeys.token);
    StorageHelper.remove(APP_CONFIG.storageKeys.refreshToken);
    StorageHelper.remove(APP_CONFIG.storageKeys.user);

    // Reset state
    this._isAuthenticated.set(false);
    this._currentUser.set(null);

    // Navigate to login
    this.router.navigate([AUTH_ROUTES.login]);
  }

  /**
   * Refresh token
   */
  refreshToken(): void {
    const refreshToken = StorageHelper.get<string>(APP_CONFIG.storageKeys.refreshToken);

    if (!refreshToken) {
      this.logout();
      return;
    }

    this.http
      .post<{ access: string }>(API_ENDPOINTS.auth.refresh, { refresh: refreshToken })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          StorageHelper.set(APP_CONFIG.storageKeys.token, response.access);
        },
        error: () => {
          this.logout();
        },
      });
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.userRole() === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.userRole());
  }

  /**
   * Handle successful login
   */
  private handleLoginSuccess(response: LoginResponse): void {
    // Store tokens and user
    StorageHelper.set(APP_CONFIG.storageKeys.token, response.access);
    StorageHelper.set(APP_CONFIG.storageKeys.refreshToken, response.refresh);
    StorageHelper.set(APP_CONFIG.storageKeys.user, response.user);

    // Update state
    this._isAuthenticated.set(true);
    this._currentUser.set(response.user);

    // Navigate to admin dashboard
    this.router.navigate([ADMIN_ROUTES.dashboard]);
  }
}
