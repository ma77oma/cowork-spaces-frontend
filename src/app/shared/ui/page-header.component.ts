import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <div>
        <h2>{{ title() }}</h2>
        @if (subtitle()) {
          <p>{{ subtitle() }}</p>
        }
      </div>

      @if (actionLabel() && actionLink()) {
        <a class="page-header__action" [routerLink]="actionLink()!">{{ actionLabel() }}</a>
      }
    </header>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      h2 {
        margin: 0;
        font-size: 1.75rem;
      }

      p {
        margin: 0.45rem 0 0;
        color: #64748b;
      }

      .page-header__action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0.8rem 1.1rem;
        border-radius: 12px;
        color: #f8fafc;
        text-decoration: none;
        background: #2563eb;
      }
    `
  ]
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly actionLabel = input<string>('');
  readonly actionLink = input<string | string[] | null>(null);
}
