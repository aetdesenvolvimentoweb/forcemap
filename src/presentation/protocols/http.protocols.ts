export interface HttpRequest<REQ = unknown> {
  body?: REQ;
  params?: Record<string, string>;
  query?: unknown;
  headers?: unknown;
}

export interface HttpResponse<RES = unknown> {
  body?: {
    data?: RES;
    error?: string;
  };
  statusCode: number;
  headers?: unknown;
}
