import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  canConfirmReservation,
  ReservationResponse
} from '../../../core/models/reservation.model';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';
import { getHttpErrorMessage } from '../../../core/utils/error-message.util';
import { ErrorPanelComponent } from '../../../shared/ui/error-panel.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { LoadingStateComponent } from '../../../shared/ui/loading-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge.component';
import { ReservationsService } from '../services/reservations.service';

@Component({
  selector: 'app-admin-reservations-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorPanelComponent
  ],
  templateUrl: './admin-reservations-page.component.html',
  styleUrl: './admin-reservations-page.component.scss'
})
export class AdminReservationsPageComponent {
  private readonly reservationsService = inject(ReservationsService);
  private readonly feedback = inject(UiFeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly reservations = signal<ReservationResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly refreshing = signal(false);
  protected readonly confirmingId = signal('');
  protected readonly errorMessage = signal('');
  protected readonly pendingReservations = computed(() =>
    this.reservations().filter((reservation) => reservation.status === 'Pending')
  );
  protected readonly canConfirmReservation = canConfirmReservation;

  constructor() {
    this.loadReservations(true);
  }

  protected refreshReservations(): void {
    this.loadReservations(false);
  }

  protected confirmReservation(reservation: ReservationResponse): void {
    this.errorMessage.set('');
    this.confirmingId.set(reservation.id);

    this.reservationsService
      .confirm(reservation.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.confirmingId.set(''))
      )
      .subscribe({
        next: (response) => {
          this.reservations.update((items) =>
            items.map((item) =>
              item.id === reservation.id
                ? {
                    ...item,
                    status: response.status
                  }
                : item
            )
          );

          this.feedback.showSuccess('Reserva confirmada correctamente');
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
      .getAll()
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
