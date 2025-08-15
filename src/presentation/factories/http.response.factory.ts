import type { AppError } from "@domain/errors";

import type { HttpResponse } from "@presentation/protocols";

export class HttpResponseFactory {
  public readonly created = (): HttpResponse<null> => ({
    statusCode: 201,
  });

  public readonly badRequest = (error: AppError): HttpResponse<null> => ({
    statusCode: error.statusCode,
    body: { error: error.message },
  });

  public readonly serverError = (): HttpResponse<null> => ({
    statusCode: 500,
    body: { error: "Erro interno no servidor." },
  });
}
