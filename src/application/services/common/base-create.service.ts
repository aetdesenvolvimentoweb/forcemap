/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BaseCreateServiceDeps<TSanitizer, TValidator, TRepository> {
  repository: TRepository;
  sanitizer: TSanitizer;
  validator: TValidator;
}

export abstract class BaseCreateService<TData> {
  protected readonly repository: any;
  protected readonly sanitizer: any;
  protected readonly validator: any;

  constructor(deps: BaseCreateServiceDeps<any, any, any>) {
    this.repository = deps.repository;
    this.sanitizer = deps.sanitizer;
    this.validator = deps.validator;
  }

  public readonly create = async (data: TData): Promise<void> => {
    const sanitizedData = this.sanitize(data);
    await this.validate(sanitizedData);
    await this.execute(sanitizedData);
  };

  protected sanitize(data: TData): TData {
    return this.sanitizer.sanitize(data);
  }

  protected async validate(data: TData): Promise<void> {
    await this.validator.validate(data);
  }

  protected async execute(data: TData): Promise<void> {
    await this.repository.create(data);
  }
}
