import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../models/api-error.model';

export function getHttpErrorMessage(error: HttpErrorResponse): string {
  const apiError = error.error as ApiErrorResponse | null;
  const apiMessage = typeof apiError?.message === 'string' ? apiError.message : null;

  if (apiMessage) {
    return apiMessage;
  }

  switch (error.status) {
    case 0:
      return 'No fue posible conectar con el servidor.';
    case 400:
      return 'Revisa los datos ingresados e inténtalo nuevamente.';
    case 401:
      return 'Tu sesión expiró o no tienes autorización. Inicia sesión nuevamente.';
    case 403:
      return 'Acceso denegado para esta operación.';
    case 404:
      return 'No se encontró la información solicitada.';
    case 409:
      return 'La operación entra en conflicto con el estado actual o la disponibilidad seleccionada.';
    default:
      return 'Ocurrió un error inesperado. Inténtalo nuevamente.';
  }
}
