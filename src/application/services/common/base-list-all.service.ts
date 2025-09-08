/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BaseListAllServiceDeps {
  repository: any;
}

export abstract class BaseListAllService<TOutput> {
  protected readonly repository: any;

  constructor(deps: BaseListAllServiceDeps) {
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
