import { Injectable, signal } from '@angular/core';
import { AppErrorMessage } from '../models/api-error.model';

@Injectable({ providedIn: 'root' })
export class UiFeedbackService {
  readonly message = signal<AppErrorMessage | null>(null);

  showError(text: string): void {
    this.message.set({ kind: 'error', text });
  }

  showSuccess(text: string): void {
    this.message.set({ kind: 'success', text });
  }

  showInfo(text: string): void {
    this.message.set({ kind: 'info', text });
  }

  clear(): void {
    this.message.set(null);
  }
}
