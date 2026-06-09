import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/api/api-client.service';
import {
  CancelReservationResponse,
  ConfirmReservationResponse,
  CreateReservationRequest,
  normalizeReservationStatus,
  PreviewPriceRequest,
  PreviewPriceResponse,
  ReservationResponse,
  ReservationStatusValue
} from '../../../core/models/reservation.model';

type RawReservationResponse = Omit<ReservationResponse, 'status'> & {
  status: ReservationStatusValue;
};

type RawCancelReservationResponse = Omit<CancelReservationResponse, 'status'> & {
  status: ReservationStatusValue;
};

type RawConfirmReservationResponse = Omit<ConfirmReservationResponse, 'status'> & {
  status: ReservationStatusValue;
};

@Injectable({ providedIn: 'root' })
export class ReservationsService {
  private readonly api = inject(ApiClientService);

  create(payload: CreateReservationRequest): Observable<ReservationResponse> {
    return this.api.post<RawReservationResponse>('/api/reservations', payload).pipe(
      map((reservation) => this.normalizeReservation(reservation))
    );
  }

  previewPrice(payload: PreviewPriceRequest): Observable<PreviewPriceResponse> {
    return this.api.post<PreviewPriceResponse>('/api/reservations/preview-price', payload);
  }

  getById(id: string): Observable<ReservationResponse> {
    return this.api.get<RawReservationResponse>(`/api/reservations/${id}`).pipe(
      map((reservation) => this.normalizeReservation(reservation))
    );
  }

  getMyReservations(): Observable<ReservationResponse[]> {
    return this.api.get<RawReservationResponse[]>('/api/reservations/my').pipe(
      map((reservations) => reservations.map((reservation) => this.normalizeReservation(reservation)))
    );
  }

  getAll(): Observable<ReservationResponse[]> {
    return this.api.get<RawReservationResponse[]>('/api/reservations/my').pipe(
      map((reservations) => reservations.map((reservation) => this.normalizeReservation(reservation)))
    );
  }

  cancel(id: string): Observable<CancelReservationResponse> {
    return this.api.post<RawCancelReservationResponse>(`/api/reservations/${id}/cancel`, {}).pipe(
      map((response) => ({
        ...response,
        status: normalizeReservationStatus(response.status)
      }))
    );
  }

  confirm(id: string): Observable<ConfirmReservationResponse> {
    return this.api.post<RawConfirmReservationResponse>(`/api/reservations/${id}/confirm`, {}).pipe(
      map((response) => ({
        ...response,
        status: normalizeReservationStatus(response.status)
      }))
    );
  }

  private normalizeReservation(reservation: RawReservationResponse): ReservationResponse {
    return {
      ...reservation,
      status: normalizeReservationStatus(reservation.status)
    };
  }
}
