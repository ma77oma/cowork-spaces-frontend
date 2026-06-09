import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-panel',
  standalone: true,
  template: `
    <div class="panel" [class]="variant()">
      <span>{{ message() }}</span>

      @if (dismissible()) {
        <button type="button" (click)="closed.emit()">Cerrar</button>
      }
    </div>
  `,
  styles: [
    `
      .panel {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.95rem 1rem;
        border-radius: 14px;
        border: 1px solid transparent;
      }

      .panel.error {
        color: #991b1b;
        background: #fef2f2;
        border-color: #fecaca;
      }

      .panel.success {
        color: #166534;
        background: #f0fdf4;
        border-color: #bbf7d0;
      }

      .panel.info {
        color: #1d4ed8;
        background: #eff6ff;
        border-color: #bfdbfe;
      }

      button {
        border: 0;
        background: transparent;
        font-weight: 600;
        cursor: pointer;
      }
    `
  ]
})
export class ErrorPanelComponent {
  readonly message = input.required<string>();
  readonly variant = input<'error' | 'success' | 'info'>('error');
  readonly dismissible = input(false);
  readonly closed = output<void>();
}
