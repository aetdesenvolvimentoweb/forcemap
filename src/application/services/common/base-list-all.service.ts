export interface BaseListAllServiceDeps<TOutput> {
  repository: { listAll(): Promise<TOutput[]> };
}

export abstract class BaseListAllService<TOutput> {
  protected readonly repository: { listAll(): Promise<TOutput[]> };

  constructor(deps: BaseListAllServiceDeps<TOutput>) {
    this.repository = deps.repository;
  }

  public readonly listAll = async (): Promise<TOutput[]> => {
    const result = await this.execute();

    return result;
  };

  protected async execute(): Promise<TOutput[]> {
    return await this.repository.listAll();
  }
}
