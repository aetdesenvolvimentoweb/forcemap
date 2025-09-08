/* eslint-disable @typescript-eslint/no-unused-vars */
export interface BaseDeleteServiceDeps {
  repository: { delete(id: string): Promise<void> };
  idSanitizer: { sanitize(id: string): string };
  idValidator: { validate(id: string): void };
  idRegisteredValidator: { validate(id: string): Promise<void> };
}

export abstract class BaseDeleteService {
  protected readonly repository: { delete(id: string): Promise<void> };
  protected readonly idSanitizer: { sanitize(id: string): string };
  protected readonly idValidator: { validate(id: string): void };
  protected readonly idRegisteredValidator: {
    validate(id: string): Promise<void>;
  };

  constructor(deps: BaseDeleteServiceDeps) {
    this.repository = deps.repository;
    this.idSanitizer = deps.idSanitizer;
    this.idValidator = deps.idValidator;
    this.idRegisteredValidator = deps.idRegisteredValidator;
  }

  public readonly delete = async (id: string): Promise<void> => {
    const sanitizedId = this.sanitizeId(id);
    this.validateId(sanitizedId);
    await this.validateIdExists(sanitizedId);
    await this.performAdditionalValidations(sanitizedId);

    await this.execute(sanitizedId);
  };

  protected sanitizeId(id: string): string {
    return this.idSanitizer.sanitize(id);
  }

  protected validateId(id: string): void {
    this.idValidator.validate(id);
  }

  protected async validateIdExists(id: string): Promise<void> {
    await this.idRegisteredValidator.validate(id);
  }

  protected async performAdditionalValidations(_id: string): Promise<void> {
    // Override point for additional validations (like inUseValidator)
  }

  protected async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
