/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BaseDeleteServiceDeps {
  repository: any;
  idSanitizer: any;
  idValidator: any;
  idRegisteredValidator: any;
}

export abstract class BaseDeleteService {
  protected readonly repository: any;
  protected readonly idSanitizer: any;
  protected readonly idValidator: any;
  protected readonly idRegisteredValidator: any;

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
