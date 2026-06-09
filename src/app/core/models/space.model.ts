export type SpaceStatus = 'Active' | 'Maintenance';
export type SpaceStatusValue = SpaceStatus | number | string;

export interface SpaceResponse {
  id: string;
  name: string;
  capacity: number;
  baseHourlyRate: number;
  openingTime: string;
  closingTime: string;
  status: SpaceStatus;
}

export interface SpaceUpsertPayload {
  name: string;
  capacity: number;
  baseHourlyRate: number;
  openingTime: string;
  closingTime: string;
  status: SpaceStatus;
}

export function normalizeSpaceStatus(status: SpaceStatusValue): SpaceStatus {
  if (status === 'Active' || status === 'Maintenance') {
    return status;
  }

  if (typeof status === 'number') {
    if (status === 1) {
      return 'Active';
    }

    return 'Maintenance';
  }

  const normalized = String(status).trim().toLowerCase();

  if (normalized === '1' || normalized === 'active') {
    return 'Active';
  }

  return 'Maintenance';
}

export function serializeSpaceStatus(status: SpaceStatus): number {
  return status === 'Active' ? 1 : 2;
}
