import { AppError } from "../../domain/errors/app.error";

export class MissingParamError extends AppError {
  constructor(paramName: string) {
    super(`O campo ${paramName} precisa ser preenchido.`, 422);
    this.name = "MissingParamError";
  }
}
