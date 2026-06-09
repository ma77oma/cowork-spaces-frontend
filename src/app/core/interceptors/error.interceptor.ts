import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { UiFeedbackService } from '../services/ui-feedback.service';
import { getHttpErrorMessage } from '../utils/error-message.util';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const feedback = inject(UiFeedbackService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthRequest = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');
      const message = getHttpErrorMessage(error);

      if (error.status === 401 && !isAuthRequest) {
        authService.logout(false);
        feedback.showError(message);
        void router.navigateByUrl('/login');
      } else if (error.status === 403 || error.status === 404 || error.status >= 500) {
        feedback.showError(message);
      }

      return throwError(() => error);
    })
  );
};
