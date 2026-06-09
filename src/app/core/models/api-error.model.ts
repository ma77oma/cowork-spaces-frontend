export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  details: unknown;
}

export interface AppErrorMessage {
  kind: 'error' | 'success' | 'info';
  text: string;
}
