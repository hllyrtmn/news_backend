import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard to protect routes that require authentication
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login page with return URL
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

/**
 * Guard to protect routes that should only be accessible by guests (not authenticated)
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Redirect authenticated users to home
  router.navigate(['/']);
  return false;
};

/**
 * Guard to protect routes that require specific user types
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (allowedRoles.includes(currentUser.user_type)) {
      return true;
    }

    // Redirect to unauthorized page
    router.navigate(['/unauthorized']);
    return false;
  };
};
