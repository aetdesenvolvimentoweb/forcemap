import { AppError } from "../../domain/errors";
import { HttpResponse } from "../protocols";
import { badRequest, serverError } from "./http.responses";

export const handleError = (error: unknown): HttpResponse => {
  if (error instanceof AppError) {
    return badRequest(error);
  }
  return serverError();
};
