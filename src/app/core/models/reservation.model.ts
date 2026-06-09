export type ReservationStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
export type ReservationStatusValue = ReservationStatus | number | string;

export interface ReservationResponse {
  id: string;
  spaceId: string;
  spaceName: string;
  startAt: string;
  endAt: string;
  durationHours: number;
  finalPrice: number;
  refundAmount: number | null;
  status: ReservationStatus;
  createdAt: string;
  cancelledAt: string | null;
}

export interface ConfirmReservationResponse {
  reservationId: string;
  status: ReservationStatus;
}

export interface CreateReservationRequest {
  spaceId: string;
  startAt: string;
  endAt: string;
}

export interface PreviewPriceRequest {
  spaceId: string;
  startAt: string;
  endAt: string;
}

export interface PreviewPriceResponse {
  spaceId: string;
  startAt: string;
  endAt: string;
  durationHours: number;
  baseHourlyRate: number;
  finalPrice: number;
}

export interface CancelReservationResponse {
  reservationId: string;
  status: ReservationStatus;
  refundAmount: number | null;
  cancelledAt: string;
}

export function normalizeReservationStatus(status: ReservationStatusValue): ReservationStatus {
  if (
    status === 'Pending' ||
    status === 'Confirmed' ||
    status === 'Cancelled' ||
    status === 'Completed'
  ) {
    return status;
  }

  if (typeof status === 'number') {
    switch (status) {
      case 2:
        return 'Confirmed';
      case 3:
        return 'Cancelled';
      case 4:
        return 'Completed';
      default:
        return 'Pending';
    }
  }

  switch (String(status).trim().toLowerCase()) {
    case '2':
    case 'confirmed':
      return 'Confirmed';
    case '3':
    case 'cancelled':
    case 'canceled':
      return 'Cancelled';
    case '4':
    case 'completed':
      return 'Completed';
    default:
      return 'Pending';
  }
}

export function canCancelReservation(status: ReservationStatus): boolean {
  return status === 'Pending' || status === 'Confirmed';
}

export function canConfirmReservation(status: ReservationStatus): boolean {
  return status === 'Pending';
}
