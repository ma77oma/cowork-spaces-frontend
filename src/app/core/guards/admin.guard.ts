import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UiFeedbackService } from '../services/ui-feedback.service';

const checkAdminAccess = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const feedback = inject(UiFeedbackService);

  if (authService.isAdmin()) {
    return true;
  }

  feedback.showError('Solo el administrador puede acceder al módulo de espacios.');
  return router.createUrlTree([authService.getDefaultRoute()]);
};

export const adminGuard: CanActivateFn = () => checkAdminAccess();
export const adminChildGuard: CanActivateChildFn = () => checkAdminAccess();
