import { Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { dateRangeValidator } from '../../../core/utils/date-range.validator';
import { PreviewPriceResponse } from '../../../core/models/reservation.model';
import { SpaceResponse } from '../../../core/models/space.model';
import { ErrorPanelComponent } from '../../../shared/ui/error-panel.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge.component';
import { SpaceAvailabilityListComponent } from './space-availability-list.component';

type ReservationFormValue = {
  spaceId: string;
  reservationDate: Date | null;
  startTime: string;
  endTime: string;
};

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    ErrorPanelComponent,
    StatusBadgeComponent,
    DatePickerModule,
    SpaceAvailabilityListComponent
  ],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.scss'
})
export class ReservationFormComponent {
  readonly spaces = input<SpaceResponse[]>([]);
  readonly preview = input<PreviewPriceResponse | null>(null);
  readonly submitting = input(false);
  readonly previewLoading = input(false);
  readonly errorMessage = input('');
  readonly initialSpaceId = input('');

  readonly previewRequested = output<ReservationFormValue>();
  readonly previewInvalidated = output<void>();
  readonly submitted = output<ReservationFormValue>();
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = new FormGroup(
    {
      spaceId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      reservationDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),
      startTime: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      endTime: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    },
    { validators: [dateRangeValidator('startTime', 'endTime'), reservationScheduleValidator(() => this.spaces())] }
  );

  constructor() {
    effect(() => {
      const spaceId = this.initialSpaceId();

      if (spaceId) {
        this.form.patchValue({ spaceId });
      }
    });

    effect(() => {
      this.spaces();
      this.form.updateValueAndValidity({ emitEvent: false });
    });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.previewInvalidated.emit();
    });
  }

  protected requestPreview(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.previewRequested.emit(this.form.getRawValue());
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  protected getSelectedSpace(): SpaceResponse | undefined {
    const selectedId = this.form.controls.spaceId.value;
    return this.spaces().find((space) => space.id === selectedId);
  }

  protected getReservationDate(): Date | null {
    return this.form.controls.reservationDate.value;
  }

  protected getScheduleErrorMessage(): string {
    if (this.form.errors?.['invalidDateRange']) {
      return 'La hora de fin debe ser posterior a la hora de inicio.';
    }

    if (this.form.errors?.['outsideSchedule']) {
      return 'La reserva debe estar dentro del horario de apertura y cierre del espacio.';
    }

    return '';
  }

  protected isControlInvalid(controlName: 'spaceId' | 'reservationDate' | 'startTime' | 'endTime'): boolean {
    const control = this.form.controls[controlName];
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected isScheduleInvalid(): boolean {
    return !!this.getScheduleErrorMessage() && (this.form.touched || this.form.dirty);
  }

}

function reservationScheduleValidator(getSpaces: () => SpaceResponse[]) {
  return (control: AbstractControl): ValidationErrors | null => {
    const spaceId = control.get('spaceId')?.value as string | undefined;
    const startTime = control.get('startTime')?.value as string | undefined;
    const endTime = control.get('endTime')?.value as string | undefined;

    if (!spaceId || !startTime || !endTime) {
      return null;
    }

    const selectedSpace = getSpaces().find((space) => space.id === spaceId);

    if (!selectedSpace) {
      return null;
    }

    const openingMinutes = parseTimeToMinutes(selectedSpace.openingTime);
    const closingMinutes = parseTimeToMinutes(selectedSpace.closingTime);
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);

    if (openingMinutes === null || closingMinutes === null || startMinutes === null || endMinutes === null) {
      return null;
    }

    return startMinutes >= openingMinutes && endMinutes <= closingMinutes ? null : { outsideSchedule: true };
  };
}

function parseTimeToMinutes(time: string): number | null {
  const parts = time.split(':').map((value) => Number(value));

  if (parts.length < 2 || parts.some((value) => Number.isNaN(value))) {
    return null;
  }

  return parts[0] * 60 + parts[1];
}
