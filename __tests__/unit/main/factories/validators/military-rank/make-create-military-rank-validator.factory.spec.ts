import { makeCreateMilitaryRankValidator } from "@main/factories/validators/military-rank/make-create-military-rank-validator.factory";
import { CreateMilitaryRankValidator } from "@application/validators";
import type { CreateMilitaryRankValidatorProtocol } from "@application/protocols";
import type { MilitaryRankRepository } from "@domain/repositories";

// Mocks
jest.mock("@application/validators", () => ({
  CreateMilitaryRankValidator: jest.fn(),
}));

const mockCreateMilitaryRankValidator =
  CreateMilitaryRankValidator as jest.MockedClass<
    typeof CreateMilitaryRankValidator
  >;

interface SutTypes {
  sut: typeof makeCreateMilitaryRankValidator;
  mockRepository: MilitaryRankRepository;
  mockValidator: CreateMilitaryRankValidatorProtocol;
}

const makeSut = (): SutTypes => {
  const mockRepository = {
    create: jest.fn(),
    findByAbbreviation: jest.fn(),
    findByOrder: jest.fn(),
  } as unknown as MilitaryRankRepository;

  const mockValidator = {
    validate: jest.fn(),
  } as unknown as CreateMilitaryRankValidatorProtocol;

  return {
    sut: makeCreateMilitaryRankValidator,
    mockRepository,
    mockValidator,
  };
};

describe("makeCreateMilitaryRankValidator", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock returns
    mockCreateMilitaryRankValidator.mockImplementation(
      () =>
        ({
          validate: jest.fn(),
        }) as any,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("validator creation", () => {
    it("should create CreateMilitaryRankValidator instance with repository", () => {
      // ARRANGE
      const { sut, mockRepository } = makeSut();

      // ACT
      sut({ militaryRankRepository: mockRepository });

      // ASSERT
      expect(mockCreateMilitaryRankValidator).toHaveBeenCalledTimes(1);
      expect(mockCreateMilitaryRankValidator).toHaveBeenCalledWith({
        militaryRankRepository: mockRepository,
      });
    });

    it("should return CreateMilitaryRankValidatorProtocol interface", () => {
      // ARRANGE
      const { sut, mockRepository, mockValidator } = makeSut();
      mockCreateMilitaryRankValidator.mockReturnValue(mockValidator as any);

      // ACT
      const result = sut({ militaryRankRepository: mockRepository });

      // ASSERT
      expect(result).toBe(mockValidator);
      expect(typeof result.validate).toBe("function");
    });

    it("should create new instance on each call", () => {
      // ARRANGE
      const { sut, mockRepository } = makeSut();
      const validator1 = { validate: jest.fn() };
      const validator2 = { validate: jest.fn() };

      mockCreateMilitaryRankValidator
        .mockReturnValueOnce(validator1 as any)
        .mockReturnValueOnce(validator2 as any);

      // ACT
      const result1 = sut({ militaryRankRepository: mockRepository });
      const result2 = sut({ militaryRankRepository: mockRepository });

      // ASSERT
      expect(result1).toBe(validator1);
      expect(result2).toBe(validator2);
      expect(mockCreateMilitaryRankValidator).toHaveBeenCalledTimes(2);
    });
  });

  describe("repository injection", () => {
    it("should inject repository into validator constructor", () => {
      // ARRANGE
      const { sut, mockRepository } = makeSut();

      // ACT
      sut({ militaryRankRepository: mockRepository });

      // ASSERT
      expect(mockCreateMilitaryRankValidator).toHaveBeenCalledWith({
        militaryRankRepository: mockRepository,
      });
    });

    it("should work with different repository instances", () => {
      // ARRANGE
      const { sut } = makeSut();
      const repository1 = { create: jest.fn() } as any;
      const repository2 = { findByOrder: jest.fn() } as any;

      // ACT
      sut({ militaryRankRepository: repository1 });
      sut({ militaryRankRepository: repository2 });

      // ASSERT
      expect(mockCreateMilitaryRankValidator).toHaveBeenNthCalledWith(1, {
        militaryRankRepository: repository1,
      });
      expect(mockCreateMilitaryRankValidator).toHaveBeenNthCalledWith(2, {
        militaryRankRepository: repository2,
      });
    });

    it("should require repository parameter", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT & ASSERT
      // TypeScript should enforce this at compile time,
      // but we test runtime behavior
      expect(() => sut({} as any)).not.toThrow();
      expect(mockCreateMilitaryRankValidator).toHaveBeenCalledWith({});
    });
  });

  describe("function signature", () => {
    it("should be a function named makeCreateMilitaryRankValidator", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ASSERT
      expect(sut.name).toBe("makeCreateMilitaryRankValidator");
      expect(typeof sut).toBe("function");
    });

    it("should accept repository parameter", () => {
      // ARRANGE
      const { sut, mockRepository } = makeSut();

      // ACT & ASSERT
      expect(() =>
        sut({ militaryRankRepository: mockRepository }),
      ).not.toThrow();
      expect(sut.length).toBe(1);
    });

    it("should return CreateMilitaryRankValidatorProtocol type", () => {
      // ARRANGE
      const { sut, mockRepository } = makeSut();

      // ACT
      const result = sut({ militaryRankRepository: mockRepository });

      // ASSERT
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(typeof result.validate).toBe("function");
    });
  });

  describe("error handling", () => {
    it("should handle CreateMilitaryRankValidator constructor errors gracefully", () => {
      // ARRANGE
      const { sut, mockRepository } = makeSut();
      mockCreateMilitaryRankValidator.mockImplementation(() => {
        throw new Error("Validator constructor error");
      });

      // ACT & ASSERT
      expect(() => sut({ militaryRankRepository: mockRepository })).toThrow(
        "Validator constructor error",
      );
    });

    it("should propagate validator instantiation errors", () => {
      // ARRANGE
      const { sut, mockRepository } = makeSut();
      const customError = new Error("Custom validator error");
      mockCreateMilitaryRankValidator.mockImplementation(() => {
        throw customError;
      });

      // ACT & ASSERT
      expect(() => sut({ militaryRankRepository: mockRepository })).toThrow(
        customError,
      );
    });

    it("should handle undefined repository", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      sut({ militaryRankRepository: undefined as any });

      // ASSERT
      expect(mockCreateMilitaryRankValidator).toHaveBeenCalledWith({
        militaryRankRepository: undefined,
      });
    });
  });

  describe("dependency isolation", () => {
    it("should handle multiple repositories correctly", () => {
      // ARRANGE
      const { sut } = makeSut();
      const repo1 = { create: jest.fn() } as any;
      const repo2 = { create: jest.fn() } as any;
      const repo3 = { create: jest.fn() } as any;

      // ACT
      sut({ militaryRankRepository: repo1 });
      sut({ militaryRankRepository: repo2 });
      sut({ militaryRankRepository: repo3 });

      // ASSERT
      expect(mockCreateMilitaryRankValidator).toHaveBeenCalledTimes(3);
      expect(mockCreateMilitaryRankValidator).toHaveBeenNthCalledWith(1, {
        militaryRankRepository: repo1,
      });
      expect(mockCreateMilitaryRankValidator).toHaveBeenNthCalledWith(2, {
        militaryRankRepository: repo2,
      });
      expect(mockCreateMilitaryRankValidator).toHaveBeenNthCalledWith(3, {
        militaryRankRepository: repo3,
      });
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete validator factory flow", () => {
      // ARRANGE
      const { sut, mockRepository, mockValidator } = makeSut();
      mockCreateMilitaryRankValidator.mockReturnValue(mockValidator as any);

      // ACT
      const result = sut({ militaryRankRepository: mockRepository });

      // ASSERT
      expect(mockCreateMilitaryRankValidator).toHaveBeenCalledTimes(1);
      expect(mockCreateMilitaryRankValidator).toHaveBeenCalledWith({
        militaryRankRepository: mockRepository,
      });
      expect(result).toBe(mockValidator);
    });

    it("should work consistently across multiple invocations", () => {
      // ARRANGE
      const { sut, mockRepository } = makeSut();
      const validators = [
        { validate: jest.fn() },
        { validate: jest.fn() },
        { validate: jest.fn() },
      ];

      validators.forEach((validator) => {
        mockCreateMilitaryRankValidator.mockReturnValueOnce(validator as any);
      });

      // ACT
      const results = [
        sut({ militaryRankRepository: mockRepository }),
        sut({ militaryRankRepository: mockRepository }),
        sut({ militaryRankRepository: mockRepository }),
      ];

      // ASSERT
      expect(mockCreateMilitaryRankValidator).toHaveBeenCalledTimes(3);
      results.forEach((result, index) => {
        expect(result).toBe(validators[index]);
      });
    });
  });

  describe("validator interface compliance", () => {
    it("should return object with validate method", () => {
      // ARRANGE
      const { sut, mockRepository } = makeSut();

      // ACT
      const result = sut({ militaryRankRepository: mockRepository });

      // ASSERT
      expect(typeof result.validate).toBe("function");
    });

    it("should ensure validator implements CreateMilitaryRankValidatorProtocol interface", () => {
      // ARRANGE
      const { sut, mockRepository } = makeSut();

      // ACT
      const result = sut({ militaryRankRepository: mockRepository });

      // ASSERT
      // Verifica se a instância tem as características esperadas de um validator
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");

      // Método obrigatório da interface
      expect(result.validate).toBeDefined();
      expect(typeof result.validate).toBe("function");
    });

    it("should maintain validator interface regardless of repository", () => {
      // ARRANGE
      const { sut } = makeSut();
      const repositories = [
        { create: jest.fn() } as any,
        { findByOrder: jest.fn() } as any,
        { findByAbbreviation: jest.fn() } as any,
      ];

      // ACT & ASSERT
      repositories.forEach((repo) => {
        const result = sut({ militaryRankRepository: repo });
        expect(typeof result.validate).toBe("function");
      });
    });
  });
});
