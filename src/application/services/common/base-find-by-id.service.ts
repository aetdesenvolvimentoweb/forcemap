/* eslint-disable @typescript-eslint/no-unused-vars */
export interface BaseFindByIdServiceDeps<TOutput> {
  repository: { findById(id: string): Promise<TOutput | null> };
  idSanitizer: { sanitize(id: string): string };
  idValidator: { validate(id: string): void };
  idRegisteredValidator: { validate(id: string): Promise<void> };
}

export abstract class BaseFindByIdService<TOutput> {
  protected readonly repository: {
    findById(id: string): Promise<TOutput | null>;
  };
  protected readonly idSanitizer: { sanitize(id: string): string };
  protected readonly idValidator: { validate(id: string): void };
  protected readonly idRegisteredValidator: {
    validate(id: string): Promise<void>;
  };

  constructor(deps: BaseFindByIdServiceDeps<TOutput>) {
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
