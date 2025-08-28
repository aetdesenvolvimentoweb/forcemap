import { AppError } from "src/domain/errors";

export class MissingParamError extends AppError {
  constructor(paramName: string) {
    super(`O campo ${paramName} precisa ser preenchido.`, 422);
    this.name = "MissingParamError";
  }
}
