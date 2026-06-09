import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SpacesService } from '../services/spaces.service';
import { SpaceResponse } from '../../../core/models/space.model';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { LoadingStateComponent } from '../../../shared/ui/loading-state.component';
import { ErrorPanelComponent } from '../../../shared/ui/error-panel.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge.component';
import { getHttpErrorMessage } from '../../../core/utils/error-message.util';

@Component({
  selector: 'app-space-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyPipe,
    PageHeaderComponent,
    LoadingStateComponent,
    ErrorPanelComponent,
    StatusBadgeComponent
  ],
  templateUrl: './space-detail-page.component.html',
  styleUrl: './space-detail-page.component.scss'
})
export class SpaceDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly spacesService = inject(SpacesService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly space = signal<SpaceResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage.set('No se encontró el espacio solicitado.');
      this.loading.set(false);
      return;
    }

    this.spacesService
      .getById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (space) => this.space.set(space),
        error: (error) => this.errorMessage.set(getHttpErrorMessage(error))
      });
  }
}
