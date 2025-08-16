import { makeCreateMilitaryRankUseCase } from "@main/factories/usecases/make-create-military-rank-usecase.factory";
import { CreateMilitaryRankService } from "@application/services";
import { makeMilitaryRankRepository } from "@main/factories/repositories/make-military-rank-repository.factory";
import { makeCreateMilitaryRankSanitizer } from "@main/factories/sanitizers/make-create-military-rank-sanitizer.factory";
import { makeCreateMilitaryRankValidator } from "@main/factories/validators/make-create-military-rank-validator.factory";
import type { CreateMilitaryRankUseCase } from "@domain/usecases";

// Mocks
jest.mock("@application/services", () => ({
  CreateMilitaryRankService: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
  })),
}));

jest.mock(
  "@main/factories/repositories/make-military-rank-repository.factory",
  () => ({
    makeMilitaryRankRepository: jest.fn(),
  }),
);

jest.mock(
  "@main/factories/sanitizers/make-create-military-rank-sanitizer.factory",
  () => ({
    makeCreateMilitaryRankSanitizer: jest.fn(),
  }),
);

jest.mock(
  "@main/factories/validators/make-create-military-rank-validator.factory",
  () => ({
    makeCreateMilitaryRankValidator: jest.fn(),
  }),
);

const mockCreateMilitaryRankService =
  CreateMilitaryRankService as jest.MockedClass<
    typeof CreateMilitaryRankService
  >;
const mockMakeMilitaryRankRepository =
  makeMilitaryRankRepository as jest.MockedFunction<
    typeof makeMilitaryRankRepository
  >;
const mockMakeCreateMilitaryRankSanitizer =
  makeCreateMilitaryRankSanitizer as jest.MockedFunction<
    typeof makeCreateMilitaryRankSanitizer
  >;
const mockMakeCreateMilitaryRankValidator =
  makeCreateMilitaryRankValidator as jest.MockedFunction<
    typeof makeCreateMilitaryRankValidator
  >;

interface SutTypes {
  sut: typeof makeCreateMilitaryRankUseCase;
  mockRepository: any;
  mockSanitizer: any;
  mockValidator: any;
  mockService: CreateMilitaryRankUseCase;
}

const makeSut = (): SutTypes => {
  const mockRepository = {
    create: jest.fn(),
    findByAbbreviation: jest.fn(),
    findByOrder: jest.fn(),
  };

  const mockSanitizer = {
    sanitize: jest.fn(),
  };

  const mockValidator = {
    validate: jest.fn(),
  };

  const mockService = jest.mocked<CreateMilitaryRankUseCase>({
    create: jest.fn(),
  });

  return {
    sut: makeCreateMilitaryRankUseCase,
    mockRepository,
    mockSanitizer,
    mockValidator,
    mockService,
  };
};

describe("makeCreateMilitaryRankUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("dependency creation and injection", () => {
    it("should call all factory functions to create dependencies", () => {
      // ARRANGE
      const { sut, mockRepository, mockSanitizer, mockValidator, mockService } =
        makeSut();

      mockMakeMilitaryRankRepository.mockReturnValue(mockRepository);
      mockMakeCreateMilitaryRankSanitizer.mockReturnValue(mockSanitizer);
      mockMakeCreateMilitaryRankValidator.mockReturnValue(mockValidator);
      mockCreateMilitaryRankService.mockReturnValue(mockService as any);

      // ACT
      sut();

      // ASSERT
      expect(mockMakeMilitaryRankRepository).toHaveBeenCalledTimes(1);
      expect(mockMakeCreateMilitaryRankSanitizer).toHaveBeenCalledTimes(1);
      expect(mockMakeCreateMilitaryRankValidator).toHaveBeenCalledTimes(1);
      expect(mockCreateMilitaryRankService).toHaveBeenCalledTimes(1);
    });

    it("should create repository before validator", () => {
      // ARRANGE
      const { sut, mockRepository, mockSanitizer, mockValidator, mockService } =
        makeSut();
      const callOrder: string[] = [];

      mockMakeMilitaryRankRepository.mockImplementation(() => {
        callOrder.push("repository");
        return mockRepository;
      });

      mockMakeCreateMilitaryRankValidator.mockImplementation(() => {
        callOrder.push("validator");
        return mockValidator;
      });

      mockMakeCreateMilitaryRankSanitizer.mockReturnValue(mockSanitizer);
      mockCreateMilitaryRankService.mockReturnValue(mockService as any);

      // ACT
      sut();

      // ASSERT
      expect(callOrder).toEqual(["repository", "validator"]);
    });

    it("should pass repository to validator factory", () => {
      // ARRANGE
      const { sut, mockRepository, mockSanitizer, mockValidator, mockService } =
        makeSut();

      mockMakeMilitaryRankRepository.mockReturnValue(mockRepository);
      mockMakeCreateMilitaryRankSanitizer.mockReturnValue(mockSanitizer);
      mockMakeCreateMilitaryRankValidator.mockReturnValue(mockValidator);
      mockCreateMilitaryRankService.mockReturnValue(mockService as any);

      // ACT
      sut();

      // ASSERT
      expect(mockMakeCreateMilitaryRankValidator).toHaveBeenCalledWith({
        militaryRankRepository: mockRepository,
      });
    });

    it("should inject all dependencies into CreateMilitaryRankService", () => {
      // ARRANGE
      const { sut, mockRepository, mockSanitizer, mockValidator, mockService } =
        makeSut();

      mockMakeMilitaryRankRepository.mockReturnValue(mockRepository);
      mockMakeCreateMilitaryRankSanitizer.mockReturnValue(mockSanitizer);
      mockMakeCreateMilitaryRankValidator.mockReturnValue(mockValidator);
      mockCreateMilitaryRankService.mockReturnValue(mockService as any);

      // ACT
      sut();

      // ASSERT
      expect(mockCreateMilitaryRankService).toHaveBeenCalledWith({
        militaryRankRepository: mockRepository,
        sanitizer: mockSanitizer,
        validator: mockValidator,
      });
    });

    it("should return CreateMilitaryRankService instance", () => {
      // ARRANGE
      const { sut, mockRepository, mockSanitizer, mockValidator, mockService } =
        makeSut();

      mockMakeMilitaryRankRepository.mockReturnValue(mockRepository);
      mockMakeCreateMilitaryRankSanitizer.mockReturnValue(mockSanitizer);
      mockMakeCreateMilitaryRankValidator.mockReturnValue(mockValidator);
      mockCreateMilitaryRankService.mockReturnValue(mockService as any);

      // ACT
      const result = sut();

      // ASSERT
      expect(result).toBe(mockService);
      expect(typeof result.create).toBe("function");
    });
  });

  describe("function signature", () => {
    it("should be a function named makeCreateMilitaryRankUseCase", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ASSERT
      expect(sut.name).toBe("makeCreateMilitaryRankUseCase");
      expect(typeof sut).toBe("function");
    });

    it("should accept no parameters", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT & ASSERT
      expect(() => sut()).not.toThrow();
      expect(sut.length).toBe(0);
    });

    it("should return CreateMilitaryRankUseCase type", () => {
      // ARRANGE
      const { sut, mockRepository, mockSanitizer, mockValidator, mockService } =
        makeSut();

      mockMakeMilitaryRankRepository.mockReturnValue(mockRepository);
      mockMakeCreateMilitaryRankSanitizer.mockReturnValue(mockSanitizer);
      mockMakeCreateMilitaryRankValidator.mockReturnValue(mockValidator);
      mockCreateMilitaryRankService.mockReturnValue(mockService as any);

      // ACT
      const result = sut();

      // ASSERT
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(typeof result.create).toBe("function");
    });
  });

  describe("error handling", () => {
    it("should handle repository factory errors", () => {
      // ARRANGE
      const { sut } = makeSut();
      mockMakeMilitaryRankRepository.mockImplementation(() => {
        throw new Error("Repository factory error");
      });

      // ACT & ASSERT
      expect(() => sut()).toThrow("Repository factory error");
    });

    it("should handle sanitizer factory errors", () => {
      // ARRANGE
      const { sut, mockRepository } = makeSut();
      mockMakeMilitaryRankRepository.mockReturnValue(mockRepository);
      mockMakeCreateMilitaryRankSanitizer.mockImplementation(() => {
        throw new Error("Sanitizer factory error");
      });

      // ACT & ASSERT
      expect(() => sut()).toThrow("Sanitizer factory error");
    });

    it("should handle validator factory errors", () => {
      // ARRANGE
      const { sut, mockRepository, mockSanitizer } = makeSut();
      mockMakeMilitaryRankRepository.mockReturnValue(mockRepository);
      mockMakeCreateMilitaryRankSanitizer.mockReturnValue(mockSanitizer);
      mockMakeCreateMilitaryRankValidator.mockImplementation(() => {
        throw new Error("Validator factory error");
      });

      // ACT & ASSERT
      expect(() => sut()).toThrow("Validator factory error");
    });

    it("should handle service instantiation errors", () => {
      // ARRANGE
      const { sut, mockRepository, mockSanitizer, mockValidator } = makeSut();
      mockMakeMilitaryRankRepository.mockReturnValue(mockRepository);
      mockMakeCreateMilitaryRankSanitizer.mockReturnValue(mockSanitizer);
      mockMakeCreateMilitaryRankValidator.mockReturnValue(mockValidator);
      mockCreateMilitaryRankService.mockImplementation((props) => {
        throw new Error("Service instantiation error");
      });

      // ACT & ASSERT
      expect(() => sut()).toThrow("Service instantiation error");
    });
  });

  describe("dependency injection order", () => {
    it("should create dependencies in correct order", () => {
      // ARRANGE
      const { sut, mockRepository, mockSanitizer, mockValidator, mockService } =
        makeSut();
      const creationOrder: string[] = [];

      mockMakeMilitaryRankRepository.mockImplementation(() => {
        creationOrder.push("repository");
        return mockRepository;
      });

      mockMakeCreateMilitaryRankSanitizer.mockImplementation(() => {
        creationOrder.push("sanitizer");
        return mockSanitizer;
      });

      mockMakeCreateMilitaryRankValidator.mockImplementation(() => {
        creationOrder.push("validator");
        return mockValidator;
      });

      mockCreateMilitaryRankService.mockImplementation((props) => {
        creationOrder.push("service");
        return mockService as any;
      });

      // ACT
      sut();

      // ASSERT
      expect(creationOrder).toEqual([
        "repository",
        "sanitizer",
        "validator",
        "service",
      ]);
    });

    it("should ensure validator receives repository before service creation", () => {
      // ARRANGE
      const { sut, mockRepository, mockSanitizer, mockValidator, mockService } =
        makeSut();
      const operations: string[] = [];

      mockMakeMilitaryRankRepository.mockImplementation(() => {
        operations.push("repository-created");
        return mockRepository;
      });

      mockMakeCreateMilitaryRankValidator.mockImplementation((params) => {
        operations.push("validator-called-with-repo");
        expect(params.militaryRankRepository).toBe(mockRepository);
        return mockValidator;
      });

      mockMakeCreateMilitaryRankSanitizer.mockReturnValue(mockSanitizer);
      mockCreateMilitaryRankService.mockReturnValue(mockService as any);

      // ACT
      sut();

      // ASSERT
      expect(operations).toEqual([
        "repository-created",
        "validator-called-with-repo",
      ]);
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete factory chain", () => {
      // ARRANGE
      const { sut, mockRepository, mockSanitizer, mockValidator, mockService } =
        makeSut();

      mockMakeMilitaryRankRepository.mockReturnValue(mockRepository);
      mockMakeCreateMilitaryRankSanitizer.mockReturnValue(mockSanitizer);
      mockMakeCreateMilitaryRankValidator.mockReturnValue(mockValidator);
      mockCreateMilitaryRankService.mockReturnValue(mockService as any);

      // ACT
      const result = sut();

      // ASSERT
      // Verifica se todos os factories foram chamados
      expect(mockMakeMilitaryRankRepository).toHaveBeenCalledTimes(1);
      expect(mockMakeCreateMilitaryRankSanitizer).toHaveBeenCalledTimes(1);
      expect(mockMakeCreateMilitaryRankValidator).toHaveBeenCalledTimes(1);
      expect(mockCreateMilitaryRankService).toHaveBeenCalledTimes(1);

      // Verifica se o resultado é correto
      expect(result).toBe(mockService);
    });

    it("should create new instances on each call", () => {
      // ARRANGE
      const { sut, mockRepository, mockSanitizer, mockValidator } = makeSut();
      const service1 = { create: jest.fn() };
      const service2 = { create: jest.fn() };

      mockMakeMilitaryRankRepository.mockReturnValue(mockRepository);
      mockMakeCreateMilitaryRankSanitizer.mockReturnValue(mockSanitizer);
      mockMakeCreateMilitaryRankValidator.mockReturnValue(mockValidator);
      mockCreateMilitaryRankService
        .mockReturnValueOnce(service1 as any)
        .mockReturnValueOnce(service2 as any);

      // ACT
      const result1 = sut();
      const result2 = sut();

      // ASSERT
      expect(result1).toBe(service1);
      expect(result2).toBe(service2);
      expect(mockCreateMilitaryRankService).toHaveBeenCalledTimes(2);
    });

    it("should maintain factory isolation", () => {
      // ARRANGE
      const { sut, mockRepository, mockSanitizer, mockValidator, mockService } =
        makeSut();

      mockMakeMilitaryRankRepository.mockReturnValue(mockRepository);
      mockMakeCreateMilitaryRankSanitizer.mockReturnValue(mockSanitizer);
      mockMakeCreateMilitaryRankValidator.mockReturnValue(mockValidator);
      mockCreateMilitaryRankService.mockReturnValue(mockService as any);

      // ACT
      const result1 = sut();
      const result2 = sut();

      // ASSERT
      // Cada chamada deve criar novas instâncias
      expect(mockMakeMilitaryRankRepository).toHaveBeenCalledTimes(2);
      expect(mockMakeCreateMilitaryRankSanitizer).toHaveBeenCalledTimes(2);
      expect(mockMakeCreateMilitaryRankValidator).toHaveBeenCalledTimes(2);
      expect(mockCreateMilitaryRankService).toHaveBeenCalledTimes(2);
    });
  });

  describe("usecase interface compliance", () => {
    it("should return object implementing CreateMilitaryRankUseCase", () => {
      // ARRANGE
      const { sut, mockRepository, mockSanitizer, mockValidator, mockService } =
        makeSut();

      mockMakeMilitaryRankRepository.mockReturnValue(mockRepository);
      mockMakeCreateMilitaryRankSanitizer.mockReturnValue(mockSanitizer);
      mockMakeCreateMilitaryRankValidator.mockReturnValue(mockValidator);
      mockCreateMilitaryRankService.mockReturnValue(mockService as any);

      // ACT
      const result = sut();

      // ASSERT
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(typeof result.create).toBe("function");
    });

    it("should ensure service has create method", () => {
      // ARRANGE
      const { sut, mockRepository, mockSanitizer, mockValidator, mockService } =
        makeSut();

      mockMakeMilitaryRankRepository.mockReturnValue(mockRepository);
      mockMakeCreateMilitaryRankSanitizer.mockReturnValue(mockSanitizer);
      mockMakeCreateMilitaryRankValidator.mockReturnValue(mockValidator);
      mockCreateMilitaryRankService.mockReturnValue(mockService as any);

      // ACT
      const result = sut();

      // ASSERT
      expect(result.create).toBeDefined();
      expect(typeof result.create).toBe("function");
    });
  });
});
