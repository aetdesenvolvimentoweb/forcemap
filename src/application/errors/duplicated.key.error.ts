import { AppError } from "@domain/erros";

export class DuplicatedKeyError extends AppError {
  constructor(entity: string) {
    super(`${entity} já está em uso.`, 409);
    this.name = "DuplicatedKeyError";
  }
}
