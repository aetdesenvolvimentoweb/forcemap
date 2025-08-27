import { HttpRequest, HttpResponse } from "./http.protocols";

export interface ControllerProtocol<T = unknown> {
  handle(request: HttpRequest<T>): Promise<HttpResponse | HttpResponse<T>>;
}
