export interface HttpRequest<T = any> {
  body: T;
  params?: any;
  query?: any;
  headers?: any;
}

export interface HttpResponse<T = any> {
  body: {
    success: boolean;
    errorMessage?: string;
    data?: T;
  };
  statusCode: number;
}
