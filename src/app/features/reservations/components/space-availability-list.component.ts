import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { SpaceResponse } from '../../../core/models/space.model';

type AvailabilitySlot = {
  label: string;
  isSelected: boolean;
};

@Component({
  selector: 'app-space-availability-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (space(); as currentSpace) {
      <section class="availability-card">
        <div class="availability-card__header">
          <div>
            <h3>Disponibilidad del espacio</h3>
            <p>
              {{ selectedDateLabel() }}
            </p>
          </div>

          <strong>{{ currentSpace.openingTime }} - {{ currentSpace.closingTime }}</strong>
        </div>

        <p class="availability-card__hint">
          Este listado muestra el horario operativo del espacio. La disponibilidad final se valida con el backend al
          previsualizar o confirmar la reserva.
        </p>

        <div class="availability-card__slots">
          @for (slot of slots(); track slot.label) {
            <span class="availability-slot" [class.availability-slot--selected]="slot.isSelected">
              {{ slot.label }}
            </span>
          }
        </div>
      </section>
    }
  `,
  styles: [
    `
      .availability-card {
        margin-top: 1.5rem;
        padding: 1.25rem;
        border: 1px solid #e5e7eb;
        border-radius: 1rem;
        background: #fff;
      }

      .availability-card__header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: flex-start;
      }

      .availability-card__header h3 {
        margin: 0;
        font-size: 1rem;
      }

      .availability-card__header p {
        margin: 0.35rem 0 0;
        color: #4b5563;
      }

      .availability-card__hint {
        margin: 1rem 0 0;
        color: #4b5563;
      }

      .availability-card__slots {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1rem;
      }

      .availability-slot {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 120px;
        padding: 0.65rem 0.85rem;
        border-radius: 999px;
        background: #eef2ff;
        color: #312e81;
        font-weight: 600;
      }

      .availability-slot--selected {
        background: #dcfce7;
        color: #166534;
      }

      @media (max-width: 640px) {
        .availability-card__header {
          flex-direction: column;
        }
      }
    `
  ]
})
export class SpaceAvailabilityListComponent {
  readonly space = input<SpaceResponse | null>(null);
  readonly reservationDate = input<Date | null>(null);
  readonly startTime = input('');
  readonly endTime = input('');

  protected readonly selectedDateLabel = computed(() => {
    const date = this.reservationDate();

    if (!date) {
      return 'Selecciona una fecha para ver el horario operativo.';
    }

    return `Fecha seleccionada: ${new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date)}`;
  });

  protected readonly slots = computed<AvailabilitySlot[]>(() => {
    const currentSpace = this.space();

    if (!currentSpace) {
      return [];
    }

    const openingMinutes = parseTimeToMinutes(currentSpace.openingTime);
    const closingMinutes = parseTimeToMinutes(currentSpace.closingTime);
    const selectedStart = parseTimeToMinutes(this.startTime());
    const selectedEnd = parseTimeToMinutes(this.endTime());

    if (openingMinutes === null || closingMinutes === null || openingMinutes >= closingMinutes) {
      return [];
    }

    const slots: AvailabilitySlot[] = [];

    for (let cursor = openingMinutes; cursor < closingMinutes; cursor += 60) {
      const nextCursor = Math.min(cursor + 60, closingMinutes);
      const isSelected =
        selectedStart !== null &&
        selectedEnd !== null &&
        selectedStart < nextCursor &&
        selectedEnd > cursor;

      slots.push({
        label: `${formatMinutes(cursor)} - ${formatMinutes(nextCursor)}`,
        isSelected
      });
    }

    return slots;
  });
}

function parseTimeToMinutes(time: string): number | null {
  const parts = time.split(':').map((value) => Number(value));

  if (parts.length < 2 || parts.some((value) => Number.isNaN(value))) {
    return null;
  }

  return parts[0] * 60 + parts[1];
}

function formatMinutes(totalMinutes: number): string {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');

  return `${hours}:${minutes}`;
}
