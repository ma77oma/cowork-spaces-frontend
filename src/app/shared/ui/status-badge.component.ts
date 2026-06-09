import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="badgeClass()">{{ label() }}</span>`,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 108px;
        padding: 0.45rem 0.75rem;
        border-radius: 999px;
        font-size: 0.85rem;
        font-weight: 600;
      }

      .badge.active,
      .badge.confirmed,
      .badge.completed {
        color: #166534;
        background: #dcfce7;
      }

      .badge.maintenance,
      .badge.pending {
        color: #92400e;
        background: #fef3c7;
      }

      .badge.cancelled {
        color: #991b1b;
        background: #fee2e2;
      }
    `
  ]
})
export class StatusBadgeComponent {
  readonly value = input.required<string | number | null | undefined>();
  protected readonly badgeClass = computed(() => this.normalizeValue());
  protected readonly label = computed(() => {
    switch (this.normalizeValue()) {
      case 'active':
        return 'Activo';
      case 'maintenance':
        return 'Mantenimiento';
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmada';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Completada';
      default: {
        const value = this.value();
        return value === null || value === undefined ? '' : String(value);
      }
    }
  });

  private normalizeValue(): string {
    const value = this.value();
    return value === null || value === undefined ? '' : String(value).trim().toLowerCase();
  }
}
