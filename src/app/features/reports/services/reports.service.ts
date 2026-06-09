import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/api/api-client.service';
import { ReportResponse } from '../../../core/models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly api = inject(ApiClientService);

  getReport(from: string, to: string): Observable<ReportResponse> {
    return this.api.get<ReportResponse>('/api/reports', { from, to });
  }
}
