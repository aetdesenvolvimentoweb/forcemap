import { AppError } from "@domain/erros";

export class InvalidParamError extends AppError {
  constructor(paramName: string, reason: string) {
    super(`O campo ${paramName} é inválido: ${reason}`, 422);
    this.name = "InvalidParamError";
  }
}
