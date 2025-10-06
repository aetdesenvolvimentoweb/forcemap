export interface BaseCreateServiceDeps<TData> {
  repository: { create(data: TData): Promise<void> };
  sanitizer: { sanitize(data: TData): TData };
  validator: { validate(data: TData): void | Promise<void> };
}

/**
 * Serviço base para operações de criação (Create).
 *
 * Implementa o padrão Template Method aplicando sanitização,
 * validação e execução em sequência.
 *
 * @template TData - Tipo do DTO de entrada
 */
export abstract class BaseCreateService<TData> {
  protected readonly repository: { create(data: TData): Promise<void> };
  protected readonly sanitizer: { sanitize(data: TData): TData };
  protected readonly validator: { validate(data: TData): void | Promise<void> };

  constructor(deps: BaseCreateServiceDeps<TData>) {
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
