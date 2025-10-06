import { LoggerProtocol } from "../../application/protocols";
import { ControllerProtocol, HttpRequest, HttpResponse } from "../protocols";
import { handleError } from "../utils";

/**
 * Controlador base com funcionalidades compartilhadas.
 *
 * Fornece métodos utilitários para validação de entrada e tratamento
 * padronizado de erros.
 */
export abstract class BaseController implements ControllerProtocol {
  protected readonly logger: LoggerProtocol;

  constructor(logger: LoggerProtocol) {
    this.logger = logger;
  }

  public abstract handle(request?: HttpRequest): Promise<HttpResponse>;

  protected validateRequiredParam(
    request: HttpRequest,
    paramName: string,
  ): string | null {
    if (!request.params || !request.params[paramName]) {
      this.logger.error(`Campo obrigatório não fornecido: ${paramName}`);
      return null;
    }
    return request.params[paramName];
  }

  protected validateRequiredBody<T>(request: HttpRequest<T>): T | null {
    if (!request.body) {
      this.logger.error("Body da requisição vazio ou inválido");
      return null;
    }
    return request.body;
  }

  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    errorMessage: string,
    requestData?: unknown,
  ): Promise<T | HttpResponse> {
    try {
      return await operation();
    } catch (error: unknown) {
      this.logger.error(errorMessage, { error, requestData });
      return handleError(error);
    }
  }
}
