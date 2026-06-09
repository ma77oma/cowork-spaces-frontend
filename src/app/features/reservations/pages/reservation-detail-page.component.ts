import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReservationsService } from '../services/reservations.service';
import { canCancelReservation, ReservationResponse } from '../../../core/models/reservation.model';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { LoadingStateComponent } from '../../../shared/ui/loading-state.component';
import { ErrorPanelComponent } from '../../../shared/ui/error-panel.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge.component';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';
import { getHttpErrorMessage } from '../../../core/utils/error-message.util';

@Component({
  selector: 'app-reservation-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    PageHeaderComponent,
    LoadingStateComponent,
    ErrorPanelComponent,
    StatusBadgeComponent
  ],
  templateUrl: './reservation-detail-page.component.html',
  styleUrl: './reservation-detail-page.component.scss'
})
export class ReservationDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reservationsService = inject(ReservationsService);
  private readonly feedback = inject(UiFeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly reservation = signal<ReservationResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly cancelling = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly canCancelReservation = canCancelReservation;

  constructor() {
    this.loadReservation();
  }

  protected cancelReservation(): void {
    const currentReservation = this.reservation();

    if (!currentReservation || !window.confirm('¿Deseas cancelar esta reserva?')) {
      return;
    }

    this.cancelling.set(true);

    this.reservationsService
      .cancel(currentReservation.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cancelling.set(false))
      )
        .subscribe({
        next: (response) => {
          this.reservation.update((reservation) =>
            reservation
              ? {
                  ...reservation,
                  status: response.status,
                  refundAmount: response.refundAmount,
                  cancelledAt: response.cancelledAt
                }
              : reservation
          );

          this.feedback.showSuccess('Reserva cancelada correctamente');
        },
        error: (error) => this.errorMessage.set(getHttpErrorMessage(error))
      });
  }

  protected goToNewReservation(): void {
    void this.router.navigateByUrl('/reservations/new');
  }

  private loadReservation(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage.set('No se encontró la reserva solicitada.');
      this.loading.set(false);
      return;
    }

    this.reservationsService
      .getById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (reservation) => this.reservation.set(reservation),
        error: (error) => this.errorMessage.set(getHttpErrorMessage(error))
      });
  }
}
