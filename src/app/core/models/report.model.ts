export interface SpaceReportResponse {
  spaceId: string;
  spaceName: string;
  occupancyRate: number;
  totalIncome: number;
  totalReservations: number;
}

export interface ReportResponse {
  totalIncome: number;
  mostDemandedHour: string;
  spaces: SpaceReportResponse[];
}
