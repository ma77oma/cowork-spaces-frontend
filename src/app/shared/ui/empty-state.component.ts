import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <section class="empty-state">
      <h3>{{ title() }}</h3>
      <p>{{ description() }}</p>
    </section>
  `,
  styles: [
    `
      .empty-state {
        padding: 2rem;
        border: 1px dashed #cbd5e1;
        border-radius: 18px;
        background: #fff;
        text-align: center;
      }

      h3 {
        margin: 0 0 0.5rem;
      }

      p {
        margin: 0;
        color: #64748b;
      }
    `
  ]
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
