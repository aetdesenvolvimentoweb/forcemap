/**
 * Generic Service Factory Pattern
 * Eliminates code duplication across 50+ service factories
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RepositoryMaker<TRepository> {
  (): TRepository;
}

export interface SanitizerMaker<TSanitizer> {
  (): TSanitizer;
}

export interface ValidatorMaker<TValidator> {
  (dependency?: any): TValidator;
}

/**
 * Base interface for all service factory configurations
 */
export interface BaseServiceConfig<TService> {
  ServiceClass: new (deps: any) => TService;
}

/**
 * Configuration for Create Services (repository + sanitizer + validator)
 */
export interface CreateServiceConfig<TService>
  extends BaseServiceConfig<TService> {
  repositoryMaker: RepositoryMaker<any>;
  sanitizerMaker: SanitizerMaker<any>;
  validatorMaker: ValidatorMaker<any>;
  repositoryKey?: string; // Key name for dependency injection (default: computed from maker name)
}

/**
 * Configuration for FindById Services (repository + id sanitizer + id validators)
 */
export interface FindByIdServiceConfig<TService>
  extends BaseServiceConfig<TService> {
  repositoryMaker: RepositoryMaker<any>;
  idSanitizerMaker: SanitizerMaker<any>;
  idValidatorMaker: ValidatorMaker<any>;
  idRegisteredValidatorMaker: ValidatorMaker<any>;
  repositoryKey?: string;
}

/**
 * Configuration for Delete Services (extends FindById + optional validators)
 */
export interface DeleteServiceConfig<TService>
  extends FindByIdServiceConfig<TService> {
  inUseValidatorMaker?: ValidatorMaker<any>;
  deletionPermissionValidatorMaker?: ValidatorMaker<any>;
}

/**
 * Configuration for Update Services (repository + sanitizer + validator + id validators)
 */
export interface UpdateServiceConfig<TService>
  extends BaseServiceConfig<TService> {
  repositoryMaker: RepositoryMaker<any>;
  sanitizerMaker: SanitizerMaker<any>;
  validatorMaker: ValidatorMaker<any>;
  idValidatorMaker: ValidatorMaker<any>;
  idRegisteredValidatorMaker: ValidatorMaker<any>;
  repositoryKey?: string;
}

/**
 * Configuration for ListAll Services (repository only)
 */
export interface ListAllServiceConfig<TService>
  extends BaseServiceConfig<TService> {
  repositoryMaker: RepositoryMaker<any>;
  repositoryKey?: string;
}

/**
 * Generic Service Factory - Eliminates duplication across CRUD operations
 */
export class GenericServiceFactory {
  /**
   * Creates a Create Service instance
   */
  static createService<TService>(
    config: CreateServiceConfig<TService>,
  ): TService {
    const repository = config.repositoryMaker();
    const sanitizer = config.sanitizerMaker();
    const validator = config.validatorMaker(repository);

    const repositoryKey =
      config.repositoryKey ||
      this.getRepositoryKey(config.repositoryMaker.name);

    return new config.ServiceClass({
      [repositoryKey]: repository,
      sanitizer,
      validator,
    });
  }

  /**
   * Creates a FindById Service instance
   */
  static findByIdService<TService>(
    config: FindByIdServiceConfig<TService>,
  ): TService {
    const repository = config.repositoryMaker();
    const sanitizer = config.idSanitizerMaker();
    const idValidator = config.idValidatorMaker();
    const idRegisteredValidator = config.idRegisteredValidatorMaker(repository);

    const repositoryKey =
      config.repositoryKey ||
      this.getRepositoryKey(config.repositoryMaker.name);

    return new config.ServiceClass({
      [repositoryKey]: repository,
      sanitizer,
      idValidator,
      idRegisteredValidator,
    });
  }

  /**
   * Creates a Delete Service instance
   */
  static deleteService<TService>(
    config: DeleteServiceConfig<TService>,
  ): TService {
    const repository = config.repositoryMaker();
    const sanitizer = config.idSanitizerMaker();
    const idValidator = config.idValidatorMaker();
    const idRegisteredValidator = config.idRegisteredValidatorMaker(repository);

    const repositoryKey =
      config.repositoryKey ||
      this.getRepositoryKey(config.repositoryMaker.name);

    const dependencies: any = {
      [repositoryKey]: repository,
      sanitizer,
      idValidator,
      idRegisteredValidator,
    };

    // Optional validators for delete operations
    if (config.inUseValidatorMaker) {
      dependencies.inUseValidator = config.inUseValidatorMaker(repository);
    }

    if (config.deletionPermissionValidatorMaker) {
      dependencies.deletionPermissionValidator =
        config.deletionPermissionValidatorMaker();
    }

    return new config.ServiceClass(dependencies);
  }

  /**
   * Creates an Update Service instance
   */
  static updateService<TService>(
    config: UpdateServiceConfig<TService>,
  ): TService {
    const repository = config.repositoryMaker();
    const sanitizer = config.sanitizerMaker();
    const validator = config.validatorMaker(repository);
    const idValidator = config.idValidatorMaker();
    const idRegisteredValidator = config.idRegisteredValidatorMaker(repository);

    const repositoryKey =
      config.repositoryKey ||
      this.getRepositoryKey(config.repositoryMaker.name);

    return new config.ServiceClass({
      [repositoryKey]: repository,
      sanitizer,
      validator,
      idValidator,
      idRegisteredValidator,
    });
  }

  /**
   * Creates a ListAll Service instance
   */
  static listAllService<TService>(
    config: ListAllServiceConfig<TService>,
  ): TService {
    const repository = config.repositoryMaker();
    const repositoryKey =
      config.repositoryKey ||
      this.getRepositoryKey(config.repositoryMaker.name);

    return new config.ServiceClass({
      [repositoryKey]: repository,
    });
  }

  /**
   * Extracts repository key from maker function name
   * Example: makeMilitaryRepository -> militaryRepository
   */
  private static getRepositoryKey(makerName: string): string {
    return (
      makerName
        .replace(/^make/, "")
        .replace(/Repository$/, "Repository")
        .charAt(0)
        .toLowerCase() + makerName.replace(/^make/, "").slice(1)
    );
  }
}
