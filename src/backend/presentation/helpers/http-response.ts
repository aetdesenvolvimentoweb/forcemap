import { AppError } from "@/backend/data/errors";
import { HttpResponse } from "../protocols";

export const created = (): HttpResponse => {
  return {
    statusCode: 201,
    body: {
      success: true,
    },
  };
};

export const httpError = (error: any): HttpResponse => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: {
        success: false,
        errorMessage: error.message,
      },
    };
  }

  return serverError();
};

export const serverError = (): HttpResponse => {
  return {
    statusCode: 500,
    body: {
      success: false,
      errorMessage:
        "Erro na comunicação com o servidor. Verifique sua conexão com a internet.",
    },
  };
};
