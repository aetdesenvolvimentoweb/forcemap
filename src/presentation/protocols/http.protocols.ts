export interface HttpRequest<REQ = unknown> {
  body?: REQ;
  params?: Record<string, string>;
  query?: unknown;
  headers?: unknown;
  ip?: string;
  socket?: { remoteAddress?: string };
  user?: {
    userId: string;
    sessionId: string;
    role: string;
    militaryId: string;
  };
}

export interface HttpResponse<RES = unknown> {
  body?: {
    data?: RES;
    error?: string;
  };
  statusCode: number;
  headers?: unknown;
}
