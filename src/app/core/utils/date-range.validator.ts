import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateRangeValidator(startKey: string, endKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const start = control.get(startKey)?.value;
    const end = control.get(endKey)?.value;

    if (!start || !end) {
      return null;
    }

    if (typeof start === 'string' && typeof end === 'string' && start.includes(':') && end.includes(':')) {
      const startMinutes = parseTimeToMinutes(start);
      const endMinutes = parseTimeToMinutes(end);

      if (startMinutes === null || endMinutes === null) {
        return { invalidDateRange: true };
      }

      return endMinutes > startMinutes ? null : { invalidDateRange: true };
    }

    const startDate = start instanceof Date ? start : new Date(start);
    const endDate = end instanceof Date ? end : new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return { invalidDateRange: true };
    }

    return endDate > startDate ? null : { invalidDateRange: true };
  };
}

function parseTimeToMinutes(time: string): number | null {
  const parts = time.split(':').map((value) => Number(value));

  if (parts.length < 2 || parts.some((value) => Number.isNaN(value))) {
    return null;
  }

  return parts[0] * 60 + parts[1];
}
