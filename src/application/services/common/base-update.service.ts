/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BaseUpdateServiceDeps {
  repository: any;
  idSanitizer: any;
  dataSanitizer: any;
  idValidator: any;
  idRegisteredValidator: any;
  dataValidator: any;
}

export abstract class BaseUpdateService<TData> {
  protected readonly repository: any;
  protected readonly idSanitizer: any;
  protected readonly dataSanitizer: any;
  protected readonly idValidator: any;
  protected readonly idRegisteredValidator: any;
  protected readonly dataValidator: any;

  constructor(deps: BaseUpdateServiceDeps) {
    this.repository = deps.repository;
    this.idSanitizer = deps.idSanitizer;
    this.dataSanitizer = deps.dataSanitizer;
    this.idValidator = deps.idValidator;
    this.idRegisteredValidator = deps.idRegisteredValidator;
    this.dataValidator = deps.dataValidator;
  }

  public readonly update = async (id: string, data: TData): Promise<void> => {
    await this.beforeUpdate(id, data);

    const sanitizedId = this.sanitizeId(id);
    this.validateId(sanitizedId);
    await this.validateIdExists(sanitizedId);

    const sanitizedData = this.sanitizeData(data);
    await this.validateData(sanitizedData, sanitizedId);

    await this.execute(sanitizedId, sanitizedData);

    await this.afterUpdate(sanitizedId, sanitizedData);
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

  // Hook methods - podem ser sobrescritos por subclasses
  protected async beforeUpdate(_id: string, _data: TData): Promise<void> {
    // Override point for additional logic
  }

  protected async afterUpdate(_id: string, _data: TData): Promise<void> {
    // Override point for additional logic
  }
}
