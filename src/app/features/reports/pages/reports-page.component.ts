import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReportsService } from '../services/reports.service';
import { ReportResponse } from '../../../core/models/report.model';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { LoadingStateComponent } from '../../../shared/ui/loading-state.component';
import { ErrorPanelComponent } from '../../../shared/ui/error-panel.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { getHttpErrorMessage } from '../../../core/utils/error-message.util';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DecimalPipe,
    PageHeaderComponent,
    LoadingStateComponent,
    ErrorPanelComponent,
    EmptyStateComponent
  ],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss'
})
export class ReportsPageComponent {
  private readonly reportsService = inject(ReportsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly report = signal<ReportResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly form = new FormGroup({
    from: new FormControl(this.getMonthStart(), { nonNullable: true, validators: [Validators.required] }),
    to: new FormControl(this.getToday(), { nonNullable: true, validators: [Validators.required] })
  });

  constructor() {
    this.search();
  }

  protected search(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { from, to } = this.form.getRawValue();

    this.reportsService
      .getReport(from, to)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (report) => this.report.set(report),
        error: (error) => this.errorMessage.set(getHttpErrorMessage(error))
      });
  }

  protected getTotalReservations(report: ReportResponse): number {
    return report.spaces.reduce((sum, item) => sum + item.totalReservations, 0);
  }

  protected getIncomeBarWidth(report: ReportResponse, totalIncome: number): number {
    if (!report.totalIncome || totalIncome <= 0) {
      return 0;
    }

    return Math.min((totalIncome / report.totalIncome) * 100, 100);
  }

  protected getOccupancyBarWidth(occupancyRate: number): number {
    if (occupancyRate <= 0) {
      return 0;
    }

    return Math.min(occupancyRate, 100);
  }

  protected getReservationsBarWidth(report: ReportResponse, totalReservations: number): number {
    const maxReservations = Math.max(...report.spaces.map((space) => space.totalReservations), 0);

    if (!maxReservations || totalReservations <= 0) {
      return 0;
    }

    return Math.min((totalReservations / maxReservations) * 100, 100);
  }

  private getToday(): string {
    return this.formatLocalDate(new Date());
  }

  private getMonthStart(): string {
    const today = new Date();
    return this.formatLocalDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
