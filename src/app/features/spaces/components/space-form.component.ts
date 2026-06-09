import { Component, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ErrorPanelComponent } from '../../../shared/ui/error-panel.component';
import { SpaceStatus, SpaceUpsertPayload } from '../../../core/models/space.model';

@Component({
  selector: 'app-space-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorPanelComponent],
  templateUrl: './space-form.component.html',
  styleUrl: './space-form.component.scss'
})
export class SpaceFormComponent {
  readonly initialValue = input<SpaceUpsertPayload | null>(null);
  readonly submitLabel = input('Guardar espacio');
  readonly submitting = input(false);
  readonly errorMessage = input('');

  readonly submitted = output<SpaceUpsertPayload>();
  readonly cancelled = output<void>();

  protected readonly statuses: SpaceStatus[] = ['Active', 'Maintenance'];
  protected readonly form = new FormGroup(
    {
      name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
      capacity: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
      baseHourlyRate: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
      openingTime: new FormControl('08:00', { nonNullable: true, validators: [Validators.required] }),
      closingTime: new FormControl('18:00', { nonNullable: true, validators: [Validators.required] }),
      status: new FormControl<SpaceStatus>('Active', { nonNullable: true, validators: [Validators.required] })
    },
    { validators: [scheduleValidator] }
  );

  constructor() {
    effect(() => {
      const value = this.initialValue();

      if (value) {
        this.form.reset(value);
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }
}

function scheduleValidator(control: AbstractControl): ValidationErrors | null {
  const openingTime = control.get('openingTime')?.value;
  const closingTime = control.get('closingTime')?.value;

  if (!openingTime || !closingTime) {
    return null;
  }

  return closingTime > openingTime ? null : { invalidSchedule: true };
}
