import type { AppError } from "@domain/errors";

import type { HttpResponse } from "@presentation/protocols";

export class HttpResponseFactory {
  public readonly created = (): HttpResponse<null> => ({
    statusCode: 201,
  });

  public readonly badRequest = <T = unknown>(
    error: AppError,
  ): HttpResponse<T> => ({
    statusCode: error.statusCode,
    body: { error: error.message },
  });

  public readonly serverError = <T = unknown>(): HttpResponse<T> => ({
    statusCode: 500,
    body: { error: "Erro interno no servidor." },
  });

  public readonly ok = <T>(data?: T): HttpResponse<T> => {
    if (data) {
      return {
        statusCode: 200,
        body: { data },
      };
    }
    return {
      statusCode: 204,
    };
  };
}
