import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SpaceResponse } from '../../../core/models/space.model';
import { SpacesService } from '../services/spaces.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge.component';
import { LoadingStateComponent } from '../../../shared/ui/loading-state.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { ErrorPanelComponent } from '../../../shared/ui/error-panel.component';
import { getHttpErrorMessage } from '../../../core/utils/error-message.util';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';

@Component({
  selector: 'app-space-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyPipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorPanelComponent
  ],
  templateUrl: './space-list-page.component.html',
  styleUrl: './space-list-page.component.scss'
})
export class SpaceListPageComponent {
  private readonly spacesService = inject(SpacesService);
  private readonly feedback = inject(UiFeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly spaces = signal<SpaceResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly deletingId = signal('');
  protected readonly errorMessage = signal('');

  constructor() {
    this.loadSpaces();
  }

  protected loadSpaces(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.spacesService
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (spaces) => this.spaces.set(spaces),
        error: (error) => this.errorMessage.set(getHttpErrorMessage(error))
      });
  }

  protected deleteSpace(space: SpaceResponse): void {
    if (!window.confirm(`¿Deseas eliminar el espacio ${space.name}?`)) {
      return;
    }

    this.deletingId.set(space.id);

    this.spacesService
      .delete(space.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deletingId.set(''))
      )
      .subscribe({
        next: () => {
          this.spaces.update((spaces) => spaces.filter((item) => item.id !== space.id));
          this.feedback.showSuccess('Espacio eliminado correctamente.');
        },
        error: (error) => this.errorMessage.set(getHttpErrorMessage(error))
      });
  }
}
