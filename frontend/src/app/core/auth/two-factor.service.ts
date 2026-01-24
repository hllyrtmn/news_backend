import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api/api.service';
import {
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  TwoFactorVerifyResponse,
  TwoFactorDisableRequest,
  TwoFactorStatusResponse
} from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class TwoFactorService {
  private api = inject(ApiService);

  /**
   * Setup 2FA - Get QR code and backup codes
   */
  setup2FA(): Observable<TwoFactorSetupResponse> {
    return this.api.post<TwoFactorSetupResponse>('auth/2fa/setup/', {});
  }

  /**
   * Verify 2FA code and enable 2FA
   */
  verify2FA(code: string): Observable<TwoFactorVerifyResponse> {
    const data: TwoFactorVerifyRequest = { code };
    return this.api.post<TwoFactorVerifyResponse>('auth/2fa/verify/', data);
  }

  /**
   * Disable 2FA
   */
  disable2FA(password: string, code: string): Observable<any> {
    const data: TwoFactorDisableRequest = { password, code };
    return this.api.post('auth/2fa/disable/', data);
  }

  /**
   * Get 2FA status
   */
  get2FAStatus(): Observable<TwoFactorStatusResponse> {
    return this.api.get<TwoFactorStatusResponse>('auth/2fa/status/');
  }
}
