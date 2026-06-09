import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { ReservationFormComponent } from '../components/reservation-form.component';
import { SpacesService } from '../../spaces/services/spaces.service';
import { ReservationsService } from '../services/reservations.service';
import { SpaceResponse } from '../../../core/models/space.model';
import { PreviewPriceResponse } from '../../../core/models/reservation.model';
import { LoadingStateComponent } from '../../../shared/ui/loading-state.component';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';
import { getHttpErrorMessage } from '../../../core/utils/error-message.util';

type ReservationFormPayload = {
  spaceId: string;
  reservationDate: Date | null;
  startTime: string;
  endTime: string;
};

@Component({
  selector: 'app-reservation-create-page',
  standalone: true,
  imports: [PageHeaderComponent, ReservationFormComponent, LoadingStateComponent],
  template: `
    <app-page-header
      title="Nueva reserva"
      subtitle="Genera una reserva y valida el precio estimado antes de confirmar."
    />

    @if (loadingSpaces()) {
      <app-loading-state label="Cargando espacios disponibles..." />
    } @else {
      <app-reservation-form
        [spaces]="spaces()"
        [preview]="preview()"
        [submitting]="submitting()"
        [previewLoading]="previewLoading()"
        [errorMessage]="errorMessage()"
        [initialSpaceId]="initialSpaceId()"
        (previewRequested)="previewPrice($event)"
        (previewInvalidated)="clearPreview()"
        (submitted)="createReservation($event)"
      />
    }
  `
})
export class ReservationCreatePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly spacesService = inject(SpacesService);
  private readonly reservationsService = inject(ReservationsService);
  private readonly feedback = inject(UiFeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly spaces = signal<SpaceResponse[]>([]);
  protected readonly preview = signal<PreviewPriceResponse | null>(null);
  protected readonly loadingSpaces = signal(true);
  protected readonly previewLoading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly initialSpaceId = signal(this.route.snapshot.queryParamMap.get('spaceId') ?? '');

  constructor() {
    this.spacesService
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingSpaces.set(false))
      )
      .subscribe({
        next: (spaces) => this.spaces.set(spaces),
        error: (error) => this.errorMessage.set(getHttpErrorMessage(error))
      });
  }

  protected previewPrice(payload: ReservationFormPayload): void {
    this.errorMessage.set('');
    this.preview.set(null);
    this.previewLoading.set(true);

    this.reservationsService
      .previewPrice(this.mapPayload(payload))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.previewLoading.set(false))
      )
      .subscribe({
        next: (response) => this.preview.set(response),
        error: (error) => {
          this.preview.set(null);
          this.errorMessage.set(getHttpErrorMessage(error));
        }
      });
  }

  protected createReservation(payload: ReservationFormPayload): void {
    this.errorMessage.set('');
    this.submitting.set(true);

    this.reservationsService
      .create(this.mapPayload(payload))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitting.set(false))
      )
      .subscribe({
        next: (reservation) => {
          this.feedback.showSuccess('Reserva creada y pendiente de confirmación');
          void this.router.navigate(['/reservations', reservation.id]);
        },
        error: (error) => this.errorMessage.set(getHttpErrorMessage(error))
      });
  }

  protected clearPreview(): void {
    if (this.preview()) {
      this.preview.set(null);
    }
  }

  private mapPayload(payload: ReservationFormPayload) {
    const reservationDate = payload.reservationDate;
    const startTime = payload.startTime;
    const endTime = payload.endTime;

    if (!reservationDate || !startTime || !endTime) {
      throw new Error('Reservation date and time are required');
    }

    return {
      spaceId: payload.spaceId,
      startAt: this.buildLocalDateTime(reservationDate, startTime),
      endAt: this.buildLocalDateTime(reservationDate, endTime)
    };
  }

  private buildLocalDateTime(date: Date, time: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const [hours = '00', minutes = '00'] = time.split(':');

    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  }
}
