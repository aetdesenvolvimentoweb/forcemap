import { InMemoryMilitaryRankRepository } from "@infra/repositories";
import type { MilitaryRankRepository } from "@domain/repositories";
import {
  clearRepositoryInstance,
  makeMilitaryRankRepository,
} from "@main/factories";

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
    delete: jest.fn(),
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
          delete: jest.fn(),
        }) as any,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    clearRepositoryInstance(); // Limpa o singleton entre os testes
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
        delete: jest.fn(),
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

    it("should return same instance on multiple calls (singleton)", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      const result1 = sut();
      const result2 = sut();
      const result3 = sut();

      // ASSERT - Para InMemory, deve retornar a mesma instância (singleton)
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe(result3);
      expect(mockInMemoryMilitaryRankRepository).toHaveBeenCalledTimes(1);
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
    it("should handle InMemoryMilitaryRankRepository constructor errors gracefully on first call", () => {
      // ARRANGE
      const { sut } = makeSut();
      mockInMemoryMilitaryRankRepository.mockImplementation(() => {
        throw new Error("Repository constructor error");
      });

      // ACT & ASSERT - Erro só acontece na primeira chamada (criação do singleton)
      expect(() => sut()).toThrow("Repository constructor error");

      // Limpar o singleton para testar novamente
      clearRepositoryInstance();
      expect(() => sut()).toThrow("Repository constructor error");
    });

    it("should propagate repository instantiation errors on singleton creation", () => {
      // ARRANGE
      const { sut } = makeSut();
      const customError = new Error("Custom repository error");
      mockInMemoryMilitaryRankRepository.mockImplementation(() => {
        throw customError;
      });

      // ACT & ASSERT - Erro só acontece na primeira chamada (criação do singleton)
      expect(() => sut()).toThrow(customError);

      // Se chamar novamente depois de limpar, deve dar erro novamente
      clearRepositoryInstance();
      expect(() => sut()).toThrow(customError);
    });
  });

  describe("future extensibility", () => {
    it("should use singleton pattern for InMemory implementation", () => {
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
        delete: jest.fn(),
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

    it("should return consistent singleton across multiple invocations", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      const result1 = sut();
      const result2 = sut();
      const result3 = sut();

      // ASSERT - Como é singleton, deve ser chamado apenas 1 vez e retornar a mesma instância
      expect(mockInMemoryMilitaryRankRepository).toHaveBeenCalledTimes(1);
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });

  describe("repository interface compliance", () => {
    it("should return object with all required MilitaryRankRepository methods", () => {
      // ARRANGE
      const { sut } = makeSut();
      const requiredMethods = [
        "create",
        "findByAbbreviation",
        "findByOrder",
        "delete",
      ];

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
      expect(result.delete).toBeDefined();
    });
  });
});
