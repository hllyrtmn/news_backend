/**
 * Role Guard
 *
 * Protects routes based on user roles
 */

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StorageHelper } from '../../shared/helpers/storage.helper';
import { APP_CONFIG, USER_ROLES } from '../../shared/constants/app.constants';
import { ADMIN_ROUTES } from '../../shared/constants/routes.constants';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);

    // Get current user from storage
    const user = StorageHelper.get<User>(APP_CONFIG.storageKeys.user);

    if (!user) {
      router.navigate([ADMIN_ROUTES.dashboard]);
      return false;
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(user.role)) {
      // Redirect to dashboard with error message
      router.navigate([ADMIN_ROUTES.dashboard], {
        queryParams: { error: 'insufficient_permissions' },
      });
      return false;
    }

    return true;
  };
};

// Predefined role guards for common use cases
export const adminOnlyGuard: CanActivateFn = roleGuard([USER_ROLES.ADMIN]);

export const editorAndAboveGuard: CanActivateFn = roleGuard([
  USER_ROLES.ADMIN,
  USER_ROLES.EDITOR,
]);

export const authorAndAboveGuard: CanActivateFn = roleGuard([
  USER_ROLES.ADMIN,
  USER_ROLES.EDITOR,
  USER_ROLES.AUTHOR,
]);
