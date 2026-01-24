import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

import { ApiService } from '../api/api.service';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  TokenRefreshResponse,
  PasswordResetRequest,
  ChangePasswordRequest
} from '../../models/auth.model';
import { User } from '../../models/user.model';

interface JwtPayload {
  user_id: number;
  username: string;
  email: string;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  // State
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Signals (Angular 17+)
  public currentUserSignal = signal<User | null>(null);
  public isAuthenticatedSignal = signal<boolean>(false);

  constructor() {
    this.checkAuth();
  }

  /**
   * Login
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('auth/login/', credentials).pipe(
      tap(response => {
        if (response.requires_2fa) {
          // 2FA required, don't save tokens yet
          return;
        }

        this.setSession(response);
      })
    );
  }

  /**
   * Register
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.api.post<RegisterResponse>('auth/dj-rest-auth/registration/', data).pipe(
      tap(response => {
        // Email verification required, don't auto-login
        // User will receive verification email
      })
    );
  }

  /**
   * Logout
   */
  logout(): void {
    // Clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    // Clear state
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);

    // Redirect to login
    this.router.navigate(['/auth/login']);
  }

  /**
   * Refresh token
   */
  refreshToken(): Observable<TokenRefreshResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.logout();
      return of();
    }

    return this.api.post<TokenRefreshResponse>('auth/token/refresh/', {
      refresh: refreshToken
    }).pipe(
      tap(response => {
        this.setTokens(response.access, response.refresh);
      }),
      catchError(error => {
        this.logout();
        return of();
      })
    );
  }

  /**
   * Password reset request
   */
  requestPasswordReset(data: PasswordResetRequest): Observable<any> {
    return this.api.post('auth/dj-rest-auth/password/reset/', data);
  }

  /**
   * Password reset confirm
   */
  confirmPasswordReset(uid: string, token: string, newPassword: string): Observable<any> {
    return this.api.post('auth/dj-rest-auth/password/reset/confirm/', {
      uid,
      token,
      new_password1: newPassword,
      new_password2: newPassword
    });
  }

  /**
   * Change password
   */
  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.api.post('auth/change-password/', data);
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<User> {
    return this.api.get<User>('auth/profile/');
  }

  /**
   * Set authentication session
   */
  private setSession(authResult: LoginResponse): void {
    this.setTokens(authResult.access, authResult.refresh);

    // Save user
    localStorage.setItem('user', JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
    this.currentUserSignal.set(authResult.user);

    this.isAuthenticatedSubject.next(true);
    this.isAuthenticatedSignal.set(true);
  }

  /**
   * Set tokens
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Check if user is authenticated
   */
  isLoggedIn(): boolean {
    const token = this.getAccessToken();

    if (!token) {
      return false;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const now = Date.now() / 1000;

      // Check if token is expired
      if (decoded.exp < now) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check authentication on app init
   */
  private checkAuth(): void {
    if (this.isLoggedIn()) {
      const userStr = localStorage.getItem('user');

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          this.currentUserSubject.next(user);
          this.currentUserSignal.set(user);
          this.isAuthenticatedSubject.next(true);
          this.isAuthenticatedSignal.set(true);
        } catch (error) {
          this.logout();
        }
      }
    }
  }

  /**
   * Get token expiry time
   */
  getTokenExpiryTime(): number | null {
    const token = this.getAccessToken();

    if (!token) {
      return null;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.exp * 1000; // Convert to milliseconds
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is about to expire (within 5 minutes)
   */
  isTokenExpiringSoon(): boolean {
    const expiryTime = this.getTokenExpiryTime();

    if (!expiryTime) {
      return false;
    }

    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    return (expiryTime - now) < fiveMinutes;
  }
}
