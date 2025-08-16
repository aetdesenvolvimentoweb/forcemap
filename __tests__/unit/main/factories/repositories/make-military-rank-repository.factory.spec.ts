import { makeMilitaryRankRepository } from "@main/factories/repositories/make-military-rank-repository.factory";
import { InMemoryMilitaryRankRepository } from "@infra/repositories";
import type { MilitaryRankRepository } from "@domain/repositories";

// Mocks
jest.mock("@infra/repositories", () => ({
  InMemoryMilitaryRankRepository: jest.fn(),
}));

const mockInMemoryMilitaryRankRepository =
  InMemoryMilitaryRankRepository as jest.MockedClass<
    typeof InMemoryMilitaryRankRepository
  >;

interface SutTypes {
  sut: typeof makeMilitaryRankRepository;
  mockRepository: MilitaryRankRepository;
}

const makeSut = (): SutTypes => {
  const mockRepository = {
    create: jest.fn(),
    findByAbbreviation: jest.fn(),
    findByOrder: jest.fn(),
  } as unknown as MilitaryRankRepository;

  return {
    sut: makeMilitaryRankRepository,
    mockRepository,
  };
};

describe("makeMilitaryRankRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock returns
    mockInMemoryMilitaryRankRepository.mockImplementation(
      () =>
        ({
          create: jest.fn(),
          findByAbbreviation: jest.fn(),
          findByOrder: jest.fn(),
        }) as any,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("repository creation", () => {
    it("should create InMemoryMilitaryRankRepository instance", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      sut();

      // ASSERT
      expect(mockInMemoryMilitaryRankRepository).toHaveBeenCalledTimes(1);
      expect(mockInMemoryMilitaryRankRepository).toHaveBeenCalledWith();
    });

    it("should return MilitaryRankRepository interface", () => {
      // ARRANGE
      const { sut } = makeSut();
      const mockRepositoryInstance = {
        create: jest.fn(),
        findByAbbreviation: jest.fn(),
        findByOrder: jest.fn(),
      };
      mockInMemoryMilitaryRankRepository.mockReturnValue(
        mockRepositoryInstance as any,
      );

      // ACT
      const result = sut();

      // ASSERT
      expect(result).toBe(mockRepositoryInstance);
      expect(typeof result.create).toBe("function");
      expect(typeof result.findByAbbreviation).toBe("function");
      expect(typeof result.findByOrder).toBe("function");
    });

    it("should create new instance on each call", () => {
      // ARRANGE
      const { sut } = makeSut();
      const instance1 = { create: jest.fn() };
      const instance2 = { create: jest.fn() };

      mockInMemoryMilitaryRankRepository
        .mockReturnValueOnce(instance1 as any)
        .mockReturnValueOnce(instance2 as any);

      // ACT
      const result1 = sut();
      const result2 = sut();

      // ASSERT
      expect(result1).toBe(instance1);
      expect(result2).toBe(instance2);
      expect(mockInMemoryMilitaryRankRepository).toHaveBeenCalledTimes(2);
    });
  });

  describe("function signature", () => {
    it("should be a function named makeMilitaryRankRepository", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ASSERT
      expect(sut.name).toBe("makeMilitaryRankRepository");
      expect(typeof sut).toBe("function");
    });

    it("should accept no parameters", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT & ASSERT
      expect(() => sut()).not.toThrow();
      expect(sut.length).toBe(0);
    });

    it("should return MilitaryRankRepository type", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      const result = sut();

      // ASSERT
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(typeof result.create).toBe("function");
      expect(typeof result.findByAbbreviation).toBe("function");
      expect(typeof result.findByOrder).toBe("function");
    });
  });

  describe("error handling", () => {
    it("should handle InMemoryMilitaryRankRepository constructor errors gracefully", () => {
      // ARRANGE
      const { sut } = makeSut();
      mockInMemoryMilitaryRankRepository.mockImplementation(() => {
        throw new Error("Repository constructor error");
      });

      // ACT & ASSERT
      expect(() => sut()).toThrow("Repository constructor error");
    });

    it("should propagate repository instantiation errors", () => {
      // ARRANGE
      const { sut } = makeSut();
      const customError = new Error("Custom repository error");
      mockInMemoryMilitaryRankRepository.mockImplementation(() => {
        throw customError;
      });

      // ACT & ASSERT
      expect(() => sut()).toThrow(customError);
    });
  });

  describe("future extensibility", () => {
    it("should be easily extensible for different repository types", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      const result = sut();

      // ASSERT
      // Verifica que retorna uma implementação específica mas interface comum
      expect(result).toBeDefined();
      expect(mockInMemoryMilitaryRankRepository).toHaveBeenCalledTimes(1);

      // Interface comum deve ser mantida independente da implementação
      expect(typeof result.create).toBe("function");
      expect(typeof result.findByAbbreviation).toBe("function");
      expect(typeof result.findByOrder).toBe("function");
    });

    it("should maintain consistent interface regardless of implementation", () => {
      // ARRANGE
      const { sut } = makeSut();
      const mockImplementation = {
        create: jest.fn(),
        findByAbbreviation: jest.fn(),
        findByOrder: jest.fn(),
        customMethod: jest.fn(), // Métodos específicos da implementação
      };
      mockInMemoryMilitaryRankRepository.mockReturnValue(
        mockImplementation as any,
      );

      // ACT
      const result = sut();

      // ASSERT
      // Interface padrão deve estar sempre presente
      expect(typeof result.create).toBe("function");
      expect(typeof result.findByAbbreviation).toBe("function");
      expect(typeof result.findByOrder).toBe("function");
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete repository factory flow", () => {
      // ARRANGE
      const { sut } = makeSut();
      const mockRepositoryInstance = {
        create: jest.fn(),
        findByAbbreviation: jest.fn(),
        findByOrder: jest.fn(),
      };
      mockInMemoryMilitaryRankRepository.mockReturnValue(
        mockRepositoryInstance as any,
      );

      // ACT
      const result = sut();

      // ASSERT
      expect(mockInMemoryMilitaryRankRepository).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockRepositoryInstance);
    });

    it("should work consistently across multiple invocations", () => {
      // ARRANGE
      const { sut } = makeSut();
      const repositories = [
        {
          create: jest.fn(),
          findByAbbreviation: jest.fn(),
          findByOrder: jest.fn(),
        },
        {
          create: jest.fn(),
          findByAbbreviation: jest.fn(),
          findByOrder: jest.fn(),
        },
        {
          create: jest.fn(),
          findByAbbreviation: jest.fn(),
          findByOrder: jest.fn(),
        },
      ];

      repositories.forEach((repo) => {
        mockInMemoryMilitaryRankRepository.mockReturnValueOnce(repo as any);
      });

      // ACT
      const results = [sut(), sut(), sut()];

      // ASSERT
      expect(mockInMemoryMilitaryRankRepository).toHaveBeenCalledTimes(3);
      results.forEach((result, index) => {
        expect(result).toBe(repositories[index]);
      });
    });
  });

  describe("repository interface compliance", () => {
    it("should return object with all required MilitaryRankRepository methods", () => {
      // ARRANGE
      const { sut } = makeSut();
      const requiredMethods = ["create", "findByAbbreviation", "findByOrder"];

      // ACT
      const result = sut();

      // ASSERT
      requiredMethods.forEach((method) => {
        expect(typeof result[method as keyof MilitaryRankRepository]).toBe(
          "function",
        );
      });
    });

    it("should ensure repository implements MilitaryRankRepository interface", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      const result = sut();

      // ASSERT
      // Verifica se a instância tem as características esperadas de um repository
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");

      // Métodos obrigatórios da interface
      expect(result.create).toBeDefined();
      expect(result.findByAbbreviation).toBeDefined();
      expect(result.findByOrder).toBeDefined();
    });
  });
});
