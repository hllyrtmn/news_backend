/**
 * HTTP Service (Base)
 *
 * Base service for all HTTP operations with interceptors
 * Uses Signals + RxJS hybrid pattern (RxJS private, Signals public)
 */

import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StorageHelper } from '../../shared/helpers/storage.helper';
import { HttpHelper } from '../../shared/helpers/http.helper';
import { APP_CONFIG } from '../../shared/constants/app.constants';

interface RequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  observe?: 'body';
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly baseUrl = environment.apiUrl || 'http://localhost:8000';

  // Public Signals
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * GET request
   */
  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .get<T>(`${this.baseUrl}${endpoint}`, this.getRequestOptions(options))
      .pipe(
        catchError(error => this.handleError(error)),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, body, this.getRequestOptions(options))
      .pipe(
        catchError(error => this.handleError(error)),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .put<T>(`${this.baseUrl}${endpoint}`, body, this.getRequestOptions(options))
      .pipe(
        catchError(error => this.handleError(error)),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .patch<T>(`${this.baseUrl}${endpoint}`, body, this.getRequestOptions(options))
      .pipe(
        catchError(error => this.handleError(error)),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    this.setLoading(true);
    this.clearError();

    return this.http
      .delete<T>(`${this.baseUrl}${endpoint}`, this.getRequestOptions(options))
      .pipe(
        catchError(error => this.handleError(error)),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Get request options with auth token
   */
  private getRequestOptions(options?: RequestOptions): RequestOptions {
    const token = StorageHelper.get<string>(APP_CONFIG.storageKeys.token);

    let headers = options?.headers || {};

    // Add authorization header if token exists
    if (token) {
      headers = {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return {
      ...options,
      headers,
    };
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Bilinmeyen bir hata oluştu';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Hata: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = HttpHelper.handleError(error);
    }

    this.error.set(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  /**
   * Clear error
   */
  private clearError(): void {
    this.error.set(null);
  }
}
