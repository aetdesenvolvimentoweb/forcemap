import { AppError } from "src/domain/errors";

export class EntityNotFoundError extends AppError {
  constructor(entity: string) {
    super(`${entity} não encontrado(a) com esse ID.`, 404);
    this.name = "EntityNotFoundError";
  }
}
