import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReservationResponse } from '../../../core/models/reservation.model';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge.component';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe, StatusBadgeComponent],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.scss'
})
export class ReservationListComponent {
  readonly reservations = input.required<ReservationResponse[]>();
  readonly cancellingId = input('');
  readonly cancelRequested = output<ReservationResponse>();
}
