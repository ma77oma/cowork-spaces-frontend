import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/api/api-client.service';
import {
  normalizeSpaceStatus,
  serializeSpaceStatus,
  SpaceResponse,
  SpaceStatusValue,
  SpaceUpsertPayload
} from '../../../core/models/space.model';

type RawSpaceResponse = Omit<SpaceResponse, 'status'> & {
  status: SpaceStatusValue;
};

@Injectable({ providedIn: 'root' })
export class SpacesService {
  private readonly api = inject(ApiClientService);

  getAll(): Observable<SpaceResponse[]> {
    return this.api.get<RawSpaceResponse[]>('/api/spaces').pipe(
      map((spaces) => spaces.map((space) => this.normalizeSpace(space)))
    );
  }

  getById(id: string): Observable<SpaceResponse> {
    return this.api.get<RawSpaceResponse>(`/api/spaces/${id}`).pipe(
      map((space) => this.normalizeSpace(space))
    );
  }

  create(payload: SpaceUpsertPayload): Observable<SpaceResponse> {
    return this.api.post<RawSpaceResponse>('/api/spaces', this.serializePayload(payload)).pipe(
      map((space) => this.normalizeSpace(space))
    );
  }

  update(id: string, payload: SpaceUpsertPayload): Observable<SpaceResponse> {
    return this.api.put<RawSpaceResponse>(`/api/spaces/${id}`, this.serializePayload(payload)).pipe(
      map((space) => this.normalizeSpace(space))
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/api/spaces/${id}`);
  }

  private normalizeSpace(space: RawSpaceResponse): SpaceResponse {
    return {
      ...space,
      status: normalizeSpaceStatus(space.status)
    };
  }

  private serializePayload(payload: SpaceUpsertPayload) {
    return {
      ...payload,
      openingTime: this.normalizeTime(payload.openingTime),
      closingTime: this.normalizeTime(payload.closingTime),
      status: serializeSpaceStatus(payload.status)
    };
  }

  private normalizeTime(value: string): string {
    return value.length === 5 ? `${value}:00` : value;
  }
}
