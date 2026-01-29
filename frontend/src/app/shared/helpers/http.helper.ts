/**
 * HTTP Helper Functions
 *
 * Helper functions for HTTP operations (with side-effects)
 */

export class HttpHelper {
  /**
   * Build query params from filters object
   * @param filters Filter object
   * @returns Query string
   */
  static buildQueryParams(filters: Record<string, any>): string {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        // Handle arrays
        if (Array.isArray(value)) {
          value.forEach(item => {
            params.append(key, String(item));
          });
        } else {
          params.append(key, String(value));
        }
      }
    });

    return params.toString();
  }

  /**
   * Handle HTTP error and return user-friendly message
   * @param error HTTP error response
   * @returns Error message string
   */
  static handleError(error: any): string {
    // Check for error details in response
    if (error.error?.detail) {
      return error.error.detail;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    // Check for field errors (validation errors)
    if (error.error && typeof error.error === 'object') {
      const fieldErrors = Object.entries(error.error)
        .map(([field, messages]) => {
          if (Array.isArray(messages)) {
            return `${field}: ${messages.join(', ')}`;
          }
          return `${field}: ${messages}`;
        })
        .join('; ');

      if (fieldErrors) {
        return fieldErrors;
      }
    }

    // HTTP status based messages
    switch (error.status) {
      case 400:
        return 'Geçersiz istek';
      case 401:
        return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın';
      case 403:
        return 'Bu işlem için yetkiniz yok';
      case 404:
        return 'Kayıt bulunamadı';
      case 409:
        return 'Bu kayıt zaten mevcut';
      case 422:
        return 'Doğrulama hatası';
      case 429:
        return 'Çok fazla istek. Lütfen daha sonra tekrar deneyin';
      case 500:
        return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin';
      case 503:
        return 'Servis geçici olarak kullanılamıyor';
      default:
        if (error.status >= 500) {
          return 'Sunucu hatası';
        }
        if (error.status >= 400) {
          return 'İstek hatası';
        }
        return 'Bir hata oluştu';
    }
  }

  /**
   * Extract error messages from API response
   * @param error HTTP error response
   * @returns Array of error messages
   */
  static extractErrors(error: any): string[] {
    const errors: string[] = [];

    if (error.error) {
      if (typeof error.error === 'string') {
        errors.push(error.error);
      } else if (typeof error.error === 'object') {
        Object.entries(error.error).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach(msg => errors.push(`${field}: ${msg}`));
          } else {
            errors.push(`${field}: ${messages}`);
          }
        });
      }
    }

    if (errors.length === 0) {
      errors.push(this.handleError(error));
    }

    return errors;
  }

  /**
   * Check if error is network error
   * @param error HTTP error response
   * @returns True if network error
   */
  static isNetworkError(error: any): boolean {
    return !error.status || error.status === 0;
  }

  /**
   * Check if error is authentication error
   * @param error HTTP error response
   * @returns True if auth error (401)
   */
  static isAuthError(error: any): boolean {
    return error.status === 401;
  }

  /**
   * Check if error is permission error
   * @param error HTTP error response
   * @returns True if permission error (403)
   */
  static isPermissionError(error: any): boolean {
    return error.status === 403;
  }

  /**
   * Check if error is validation error
   * @param error HTTP error response
   * @returns True if validation error (400, 422)
   */
  static isValidationError(error: any): boolean {
    return error.status === 400 || error.status === 422;
  }

  /**
   * Build URL with query params
   * @param baseUrl Base URL
   * @param params Query parameters
   * @returns Full URL with query string
   */
  static buildUrl(baseUrl: string, params: Record<string, any>): string {
    const queryString = this.buildQueryParams(params);
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Parse query params from URL
   * @param url URL with query string
   * @returns Object with query parameters
   */
  static parseQueryParams(url: string): Record<string, string> {
    const params: Record<string, string> = {};
    const urlObj = new URL(url, window.location.origin);

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }
}
