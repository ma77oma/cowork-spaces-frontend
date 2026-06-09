import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SpacesService } from '../services/spaces.service';
import { SpaceUpsertPayload } from '../../../core/models/space.model';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { SpaceFormComponent } from '../components/space-form.component';
import { LoadingStateComponent } from '../../../shared/ui/loading-state.component';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';
import { getHttpErrorMessage } from '../../../core/utils/error-message.util';

@Component({
  selector: 'app-space-form-page',
  standalone: true,
  imports: [PageHeaderComponent, SpaceFormComponent, LoadingStateComponent],
  template: `
    <app-page-header
      [title]="isEditMode() ? 'Editar espacio' : 'Nuevo espacio'"
      [subtitle]="isEditMode() ? 'Actualiza horarios, capacidad y estado del espacio.' : 'Configura un nuevo espacio disponible para reservas.'"
    />

    @if (loadingInitial()) {
      <app-loading-state label="Cargando formulario..." />
    } @else {
      <app-space-form
        [initialValue]="initialValue()"
        [submitLabel]="isEditMode() ? 'Guardar cambios' : 'Crear espacio'"
        [submitting]="submitting()"
        [errorMessage]="errorMessage()"
        (submitted)="save($event)"
        (cancelled)="goBack()"
      />
    }
  `
})
export class SpaceFormPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly spacesService = inject(SpacesService);
  private readonly feedback = inject(UiFeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loadingInitial = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly initialValue = signal<SpaceUpsertPayload | null>(null);
  protected readonly isEditMode = signal(false);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!id);

    if (!id) {
      return;
    }

    this.loadingInitial.set(true);

    this.spacesService
      .getById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingInitial.set(false))
      )
      .subscribe({
        next: (space) =>
          this.initialValue.set({
            name: space.name,
            capacity: space.capacity,
            baseHourlyRate: space.baseHourlyRate,
            openingTime: space.openingTime,
            closingTime: space.closingTime,
            status: space.status
          }),
        error: (error) => this.errorMessage.set(getHttpErrorMessage(error))
      });
  }

  protected save(payload: SpaceUpsertPayload): void {
    this.errorMessage.set('');
    this.submitting.set(true);

    const id = this.route.snapshot.paramMap.get('id');
    const request$ = id ? this.spacesService.update(id, payload) : this.spacesService.create(payload);

    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitting.set(false))
      )
      .subscribe({
        next: (space) => {
          this.feedback.showSuccess(id ? 'Espacio actualizado correctamente.' : 'Espacio creado correctamente.');
          void this.router.navigate(['/spaces', space.id]);
        },
        error: (error) => this.errorMessage.set(getHttpErrorMessage(error))
      });
  }

  protected goBack(): void {
    void this.router.navigateByUrl('/spaces');
  }
}
