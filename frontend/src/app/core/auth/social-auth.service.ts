import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../api/api.service';
import { AuthService } from './auth.service';
import { LoginResponse } from '../../models/auth.model';
import { environment } from '../../../environments/environment';

declare const google: any;
declare const FB: any;

@Injectable({
  providedIn: 'root'
})
export class SocialAuthService {
  private api = inject(ApiService);
  private authService = inject(AuthService);

  /**
   * Initialize Google Sign-In
   */
  initGoogleAuth(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.handleGoogleCallback.bind(this)
      });
    }
  }

  /**
   * Sign in with Google
   */
  signInWithGoogle(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.prompt();
    } else {
      console.error('Google Sign-In SDK not loaded');
    }
  }

  /**
   * Render Google Sign-In button
   */
  renderGoogleButton(elementId: string): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.renderButton(
        document.getElementById(elementId),
        { theme: 'outline', size: 'large', width: '100%' }
      );
    }
  }

  /**
   * Handle Google callback
   */
  private handleGoogleCallback(response: any): void {
    this.loginWithGoogle(response.credential).subscribe({
      next: (authResponse) => {
        console.log('Google login successful');
      },
      error: (error) => {
        console.error('Google login failed:', error);
      }
    });
  }

  /**
   * Login with Google (send ID token to backend)
   */
  loginWithGoogle(idToken: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('auth/social/google/', { id_token: idToken }).pipe(
      tap(response => this.authService.setSession(response))
    );
  }

  /**
   * Initialize Facebook SDK
   */
  initFacebookAuth(): void {
    if (typeof FB !== 'undefined') {
      FB.init({
        appId: environment.facebookAppId,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    }
  }

  /**
   * Sign in with Facebook
   */
  signInWithFacebook(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof FB === 'undefined') {
        reject(new Error('Facebook SDK not loaded'));
        return;
      }

      FB.login((response: any) => {
        if (response.authResponse) {
          this.loginWithFacebook(response.authResponse.accessToken).subscribe({
            next: () => resolve(),
            error: (error) => reject(error)
          });
        } else {
          reject(new Error('Facebook login cancelled'));
        }
      }, { scope: 'public_profile,email' });
    });
  }

  /**
   * Login with Facebook (send access token to backend)
   */
  loginWithFacebook(accessToken: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('auth/social/facebook/', { access_token: accessToken }).pipe(
      tap(response => this.authService.setSession(response))
    );
  }

  /**
   * Sign in with Twitter (redirect to backend OAuth)
   */
  signInWithTwitter(): void {
    // Twitter OAuth requires server-side redirect
    window.location.href = `${environment.apiUrl}/auth/social/twitter/`;
  }

  /**
   * Handle social auth callback (for Twitter and other OAuth flows)
   */
  handleSocialAuthCallback(provider: string, code: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>(`auth/social/${provider}/callback/`, { code }).pipe(
      tap(response => this.authService.setSession(response))
    );
  }
}
