import { AppError } from "src/domain/errors";

export class DuplicatedKeyError extends AppError {
  constructor(param: string) {
    super(`${param} já está em uso.`, 409);
    this.name = "DuplicatedKeyError";
  }
}
