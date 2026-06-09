import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReservationResponse } from '../../../core/models/reservation.model';
import { ReservationsService } from '../services/reservations.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';
import { getHttpErrorMessage } from '../../../core/utils/error-message.util';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { LoadingStateComponent } from '../../../shared/ui/loading-state.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { ErrorPanelComponent } from '../../../shared/ui/error-panel.component';
import { ReservationListComponent } from '../components/reservation-list.component';

@Component({
  selector: 'app-my-reservations-page',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorPanelComponent,
    ReservationListComponent
  ],
  templateUrl: './my-reservations-page.component.html',
  styleUrl: './my-reservations-page.component.scss'
})
export class MyReservationsPageComponent {
  private readonly reservationsService = inject(ReservationsService);
  private readonly feedback = inject(UiFeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly reservations = signal<ReservationResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly refreshing = signal(false);
  protected readonly cancellingId = signal('');
  protected readonly errorMessage = signal('');

  constructor() {
    this.loadReservations(true);
  }

  protected refreshReservations(): void {
    this.loadReservations(false);
  }

  protected cancelReservation(reservation: ReservationResponse): void {
    if (!window.confirm(`¿Deseas cancelar la reserva de ${reservation.spaceName}?`)) {
      return;
    }

    this.errorMessage.set('');
    this.cancellingId.set(reservation.id);

    this.reservationsService
      .cancel(reservation.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cancellingId.set(''))
      )
      .subscribe({
        next: () => {
          this.feedback.showSuccess('Reserva cancelada correctamente');
          this.loadReservations(false);
        },
        error: (error) => this.errorMessage.set(getHttpErrorMessage(error))
      });
  }

  private loadReservations(showLoading: boolean): void {
    this.errorMessage.set('');

    if (showLoading) {
      this.loading.set(true);
    } else {
      this.refreshing.set(true);
    }

    this.reservationsService
      .getMyReservations()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (showLoading) {
            this.loading.set(false);
          } else {
            this.refreshing.set(false);
          }
        })
      )
      .subscribe({
        next: (reservations) => this.reservations.set(reservations),
        error: (error) => this.errorMessage.set(getHttpErrorMessage(error))
      });
  }
}
