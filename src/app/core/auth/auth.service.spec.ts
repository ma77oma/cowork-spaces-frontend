import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [AuthService, provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
  });

  it('should create the service', () => {
    const service = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated when there is no session', () => {
    const service = TestBed.inject(AuthService);
    expect(service.isAuthenticated()).toBeFalse();
  });
});
