/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BaseFindByIdServiceDeps {
  repository: any;
  idSanitizer: any;
  idValidator: any;
  idRegisteredValidator: any;
}

export abstract class BaseFindByIdService<TOutput> {
  protected readonly repository: any;
  protected readonly idSanitizer: any;
  protected readonly idValidator: any;
  protected readonly idRegisteredValidator: any;

  constructor(deps: BaseFindByIdServiceDeps) {
    this.repository = deps.repository;
    this.idSanitizer = deps.idSanitizer;
    this.idValidator = deps.idValidator;
    this.idRegisteredValidator = deps.idRegisteredValidator;
  }

  public readonly findById = async (id: string): Promise<TOutput | null> => {
    await this.beforeFind(id);

    const sanitizedId = this.sanitizeId(id);
    this.validateId(sanitizedId);
    await this.validateIdExists(sanitizedId);

    const result = await this.execute(sanitizedId);

    await this.afterFind(sanitizedId, result);

    return result;
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

  protected async execute(id: string): Promise<TOutput | null> {
    return await this.repository.findById(id);
  }

  // Hook methods - podem ser sobrescritos por subclasses
  protected async beforeFind(_id: string): Promise<void> {
    // Override point for additional logic
  }

  protected async afterFind(
    _id: string,
    _result: TOutput | null,
  ): Promise<void> {
    // Override point for additional logic
  }
}
