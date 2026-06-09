import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiClientService } from '../api/api-client.service';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

const SESSION_STORAGE_KEY = 'cowork-spaces.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClientService);
  private readonly router = inject(Router);
  private readonly session = signal<AuthResponse | null>(this.readStoredSession());
  private readonly validSession = computed(() => {
    const currentSession = this.session();
    return currentSession && !this.isExpired(currentSession.expiresAt) ? currentSession : null;
  });

  readonly currentUser = computed(() => this.validSession());
  readonly isAuthenticated = computed(() => !!this.validSession());
  readonly userName = computed(() => this.validSession()?.fullName ?? '');
  readonly roles = computed(() => this.extractRoles(this.validSession()?.token ?? null));
  readonly isAdmin = computed(() => this.roles().includes('admin'));

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/api/auth/login', payload).pipe(
      tap((response) => this.persistSession(response))
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/api/auth/register', payload).pipe(
      tap((response) => this.persistSession(response))
    );
  }

  getToken(): string | null {
    const session = this.validSession();

    if (!session && this.session()) {
      this.logout(false);
      return null;
    }

    return session?.token ?? null;
  }

  logout(redirect = true): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.session.set(null);

    if (redirect) {
      void this.router.navigateByUrl('/login');
    }
  }

  getDefaultRoute(): string {
    return this.isAdmin() ? '/spaces' : '/reservations/new';
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(response));
    this.session.set(response);
  }

  private readStoredSession(): AuthResponse | null {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as AuthResponse;
      return this.isExpired(parsed.expiresAt) ? null : parsed;
    } catch {
      return null;
    }
  }
  private isExpired(expiresAt: string): boolean {
    return !expiresAt || new Date(expiresAt).getTime() <= Date.now();
  }

  private extractRoles(token: string | null): string[] {
    if (!token) {
      return [];
    }

    try {
      const [, payload] = token.split('.');

      if (!payload) {
        return [];
      }

      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4), '=');
      const decodedPayload = atob(paddedPayload);
      const parsedPayload = JSON.parse(decodedPayload) as Record<string, unknown>;
      const candidateValues = [
        parsedPayload['role'],
        parsedPayload['roles'],
        parsedPayload['Role'],
        parsedPayload['Roles'],
        parsedPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      ];

      return candidateValues.flatMap((value) => this.normalizeRoleValue(value));
    } catch {
      return [];
    }
  }

  private normalizeRoleValue(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.flatMap((item) => this.normalizeRoleValue(item));
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
    }

    return [];
  }
}
