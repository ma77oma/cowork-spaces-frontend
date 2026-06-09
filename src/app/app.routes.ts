import { Routes } from '@angular/router';
import { ShellLayoutComponent } from './core/layout/shell-layout.component';
import { authChildGuard, authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { homeRedirectGuard } from './core/guards/home-redirect.guard';
import { publicOnlyGuard } from './core/guards/public-only.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [homeRedirectGuard],
    children: []
  },
  {
    path: 'login',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/auth/pages/login-page.component').then((m) => m.LoginPageComponent)
  },
  {
    path: 'register',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/auth/pages/register-page.component').then((m) => m.RegisterPageComponent)
  },
  {
    path: '',
    component: ShellLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      {
        path: 'spaces',
        canActivate: [adminGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/spaces/pages/space-list-page.component').then(
                (m) => m.SpaceListPageComponent
              )
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/spaces/pages/space-form-page.component').then(
                (m) => m.SpaceFormPageComponent
              )
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/spaces/pages/space-detail-page.component').then(
                (m) => m.SpaceDetailPageComponent
              )
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/spaces/pages/space-form-page.component').then(
                (m) => m.SpaceFormPageComponent
              )
          }
        ]
      },
      {
        path: 'admin/reservations',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/reservations/pages/admin-reservations-page.component').then(
            (m) => m.AdminReservationsPageComponent
          )
      },
      {
        path: 'reservations/new',
        loadComponent: () =>
          import('./features/reservations/pages/reservation-create-page.component').then(
            (m) => m.ReservationCreatePageComponent
          )
      },
      {
        path: 'my-reservations',
        loadComponent: () =>
          import('./features/reservations/pages/my-reservations-page.component').then(
            (m) => m.MyReservationsPageComponent
          )
      },
      {
        path: 'reservations/:id',
        loadComponent: () =>
          import('./features/reservations/pages/reservation-detail-page.component').then(
            (m) => m.ReservationDetailPageComponent
          )
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/pages/reports-page.component').then(
            (m) => m.ReportsPageComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
