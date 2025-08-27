import { AppError } from "src/domain/errors";

import { EmptyRequestError, ServerError } from "../errors";
import { HttpResponse } from "../protocols";

export const emptyRequest = (): HttpResponse => {
  const error = new EmptyRequestError();
  return { body: { error: error.message }, statusCode: error.statusCode };
};

export const badRequest = (error: AppError): HttpResponse => {
  return { body: { error: error.message }, statusCode: error.statusCode };
};

export const serverError = (): HttpResponse => {
  const error = new ServerError();
  return { body: { error: error.message }, statusCode: error.statusCode };
};

export const created = (): HttpResponse => {
  return { statusCode: 201 };
};
