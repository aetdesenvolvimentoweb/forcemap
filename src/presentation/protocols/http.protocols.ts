export interface HttpRequest<T = unknown> {
  body?: {
    data?: T;
  };
  params?: unknown;
  query?: unknown;
  headers?: unknown;
}

export interface HttpResponse<T = unknown> {
  body?: {
    data?: T;
    error?: string;
  };
  statusCode: number;
  headers?: unknown;
}
