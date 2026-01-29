/**
 * Auth Guard
 *
 * Protects routes that require authentication
 */

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StorageHelper } from '../../shared/helpers/storage.helper';
import { APP_CONFIG } from '../../shared/constants/app.constants';
import { AUTH_ROUTES } from '../../shared/constants/routes.constants';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Check if user has valid token
  const token = StorageHelper.get<string>(APP_CONFIG.storageKeys.token);

  if (!token) {
    // Redirect to login with return URL
    router.navigate([AUTH_ROUTES.login], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  // TODO: In production, validate token with backend
  // For now, just check if token exists
  return true;
};
