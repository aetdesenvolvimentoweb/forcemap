export interface BaseUpdateServiceDeps<TData> {
  repository: { update(id: string, data: TData): Promise<void> };
  idSanitizer: { sanitize(id: string): string };
  dataSanitizer: { sanitize(data: TData): TData };
  idValidator: { validate(id: string): void };
  idRegisteredValidator: { validate(id: string): Promise<void> };
  dataValidator: { validate(data: TData, id?: string): void | Promise<void> };
}

export abstract class BaseUpdateService<TData> {
  protected readonly repository: {
    update(id: string, data: TData): Promise<void>;
  };
  protected readonly idSanitizer: { sanitize(id: string): string };
  protected readonly dataSanitizer: { sanitize(data: TData): TData };
  protected readonly idValidator: { validate(id: string): void };
  protected readonly idRegisteredValidator: {
    validate(id: string): Promise<void>;
  };
  protected readonly dataValidator: {
    validate(data: TData, id?: string): void | Promise<void>;
  };

  constructor(deps: BaseUpdateServiceDeps<TData>) {
    this.repository = deps.repository;
    this.idSanitizer = deps.idSanitizer;
    this.dataSanitizer = deps.dataSanitizer;
    this.idValidator = deps.idValidator;
    this.idRegisteredValidator = deps.idRegisteredValidator;
    this.dataValidator = deps.dataValidator;
  }

  public readonly update = async (id: string, data: TData): Promise<void> => {
    const sanitizedId = this.sanitizeId(id);
    this.validateId(sanitizedId);
    await this.validateIdExists(sanitizedId);

    const sanitizedData = this.sanitizeData(data);
    await this.validateData(sanitizedData, sanitizedId);

    await this.execute(sanitizedId, sanitizedData);
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

  protected sanitizeData(data: TData): TData {
    return this.dataSanitizer.sanitize(data);
  }

  protected async validateData(data: TData, id: string): Promise<void> {
    await this.dataValidator.validate(data, id);
  }

  protected async execute(id: string, data: TData): Promise<void> {
    await this.repository.update(id, data);
  }
}
