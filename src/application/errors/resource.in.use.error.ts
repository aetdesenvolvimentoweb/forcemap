import { AppError } from "../../domain/errors/app.error";

export class ResourceInUseError extends AppError {
  constructor(resource: string, dependentResource: string) {
    super(
      `${resource} não pode ser excluído(a) pois está sendo utilizado(a) por ${dependentResource}.`,
      409,
    );
    this.name = "ResourceInUseError";
  }
}
