/* eslint-disable @typescript-eslint/no-unused-vars */
export interface BaseListAllServiceDeps<TOutput> {
  repository: { listAll(): Promise<TOutput[]> };
}

export abstract class BaseListAllService<TOutput> {
  protected readonly repository: { listAll(): Promise<TOutput[]> };

  constructor(deps: BaseListAllServiceDeps<TOutput>) {
    this.repository = deps.repository;
  }

  public readonly listAll = async (): Promise<TOutput[]> => {
    await this.beforeList();

    const result = await this.execute();

    await this.afterList(result);

    return result;
  };

  protected async execute(): Promise<TOutput[]> {
    return await this.repository.listAll();
  }

  // Hook methods - podem ser sobrescritos por subclasses
  protected async beforeList(): Promise<void> {
    // Override point for additional logic
  }

  protected async afterList(_result: TOutput[]): Promise<void> {
    // Override point for additional logic
  }
}
