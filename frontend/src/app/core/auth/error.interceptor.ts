import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error && error.error.detail) {
            errorMessage = error.error.detail;
          } else if (error.status === 0) {
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
          } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }
        }

        // Log to console for debugging
        console.error('HTTP Error:', error);

        // Return error observable with user-friendly message
        return throwError(() => ({
          status: error.status,
          message: errorMessage,
          originalError: error
        }));
      })
    );
  }
}
