import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

const checkAccess = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

export const authGuard: CanActivateFn = () => checkAccess();
export const authChildGuard: CanActivateChildFn = () => checkAccess();
