import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  template: `
    <div class="loading-state">
      <div class="loading-state__spinner"></div>
      <p>{{ label() }}</p>
    </div>
  `,
  styles: [
    `
      .loading-state {
        display: grid;
        justify-items: center;
        gap: 0.85rem;
        padding: 2rem;
        border-radius: 18px;
        background: #fff;
        border: 1px solid #dbe3ef;
      }

      .loading-state__spinner {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        border: 3px solid #dbeafe;
        border-top-color: #2563eb;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `
  ]
})
export class LoadingStateComponent {
  readonly label = input('Cargando información...');
}
