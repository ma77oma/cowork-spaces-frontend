import { Component, computed, input } from '@angular/core';
import { getStatusBadgeAppearance } from './status-badge.utils';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span
      class="badge"
      [style.background-color]="appearance().backgroundColor"
      [style.color]="appearance().textColor"
      [style.border-color]="appearance().borderColor ?? 'transparent'"
    >
      {{ appearance().label }}
    </span>
  `,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 108px;
        padding: 0.45rem 0.75rem;
        border-radius: 999px;
        border: 1px solid transparent;
        font-size: 0.85rem;
        font-weight: 600;
      }
    `
  ]
})
export class StatusBadgeComponent {
  readonly value = input.required<string | number | null | undefined>();
  protected readonly appearance = computed(() => getStatusBadgeAppearance(this.value()));
}
