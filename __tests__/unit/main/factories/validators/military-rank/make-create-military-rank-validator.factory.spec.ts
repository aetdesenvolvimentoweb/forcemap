import { MilitaryRankValidator } from "@application/validators";
import type { MilitaryRankValidatorProtocol } from "@application/protocols";
import type { MilitaryRankRepository } from "@domain/repositories";
import { makeMilitaryRankValidator } from "@main/factories";

// Mocks
jest.mock("@application/validators", () => ({
  MilitaryRankValidator: jest.fn(),
}));

const mockMilitaryRankValidator = MilitaryRankValidator as jest.MockedClass<
  typeof MilitaryRankValidator
>;

interface SutTypes {
  sut: typeof makeMilitaryRankValidator;
  mockRepository: MilitaryRankRepository;
  mockValidator: MilitaryRankValidatorProtocol;
}

const makeSut = (): SutTypes => {
  const mockRepository = {
    create: jest.fn(),
    findByAbbreviation: jest.fn(),
    findByOrder: jest.fn(),
  } as unknown as MilitaryRankRepository;

  const mockValidator = {
    validate: jest.fn(),
  } as unknown as MilitaryRankValidatorProtocol;

  return {
    sut: makeMilitaryRankValidator,
    mockRepository,
    mockValidator,
  };
};

describe("makeMilitaryRankValidator", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock returns
    mockMilitaryRankValidator.mockImplementation(
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
    it("should create MilitaryRankValidator instance with repository", () => {
      // ARRANGE
      const { sut, mockRepository } = makeSut();

      // ACT
      sut({ militaryRankRepository: mockRepository });

      // ASSERT
      expect(mockMilitaryRankValidator).toHaveBeenCalledTimes(1);
      expect(mockMilitaryRankValidator).toHaveBeenCalledWith({
        militaryRankRepository: mockRepository,
      });
    });

    it("should return MilitaryRankValidatorProtocol interface", () => {
      // ARRANGE
      const { sut, mockRepository, mockValidator } = makeSut();
      mockMilitaryRankValidator.mockReturnValue(mockValidator as any);

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

      mockMilitaryRankValidator
        .mockReturnValueOnce(validator1 as any)
        .mockReturnValueOnce(validator2 as any);

      // ACT
      const result1 = sut({ militaryRankRepository: mockRepository });
      const result2 = sut({ militaryRankRepository: mockRepository });

      // ASSERT
      expect(result1).toBe(validator1);
      expect(result2).toBe(validator2);
      expect(mockMilitaryRankValidator).toHaveBeenCalledTimes(2);
    });
  });

  describe("repository injection", () => {
    it("should inject repository into validator constructor", () => {
      // ARRANGE
      const { sut, mockRepository } = makeSut();

      // ACT
      sut({ militaryRankRepository: mockRepository });

      // ASSERT
      expect(mockMilitaryRankValidator).toHaveBeenCalledWith({
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
      expect(mockMilitaryRankValidator).toHaveBeenNthCalledWith(1, {
        militaryRankRepository: repository1,
      });
      expect(mockMilitaryRankValidator).toHaveBeenNthCalledWith(2, {
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
      expect(mockMilitaryRankValidator).toHaveBeenCalledWith({});
    });
  });

  describe("function signature", () => {
    it("should be a function named makeMilitaryRankValidator", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ASSERT
      expect(sut.name).toBe("makeMilitaryRankValidator");
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

    it("should return MilitaryRankValidatorProtocol type", () => {
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
    it("should handle MilitaryRankValidator constructor errors gracefully", () => {
      // ARRANGE
      const { sut, mockRepository } = makeSut();
      mockMilitaryRankValidator.mockImplementation(() => {
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
      mockMilitaryRankValidator.mockImplementation(() => {
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
      expect(mockMilitaryRankValidator).toHaveBeenCalledWith({
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
      expect(mockMilitaryRankValidator).toHaveBeenCalledTimes(3);
      expect(mockMilitaryRankValidator).toHaveBeenNthCalledWith(1, {
        militaryRankRepository: repo1,
      });
      expect(mockMilitaryRankValidator).toHaveBeenNthCalledWith(2, {
        militaryRankRepository: repo2,
      });
      expect(mockMilitaryRankValidator).toHaveBeenNthCalledWith(3, {
        militaryRankRepository: repo3,
      });
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete validator factory flow", () => {
      // ARRANGE
      const { sut, mockRepository, mockValidator } = makeSut();
      mockMilitaryRankValidator.mockReturnValue(mockValidator as any);

      // ACT
      const result = sut({ militaryRankRepository: mockRepository });

      // ASSERT
      expect(mockMilitaryRankValidator).toHaveBeenCalledTimes(1);
      expect(mockMilitaryRankValidator).toHaveBeenCalledWith({
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
        mockMilitaryRankValidator.mockReturnValueOnce(validator as any);
      });

      // ACT
      const results = [
        sut({ militaryRankRepository: mockRepository }),
        sut({ militaryRankRepository: mockRepository }),
        sut({ militaryRankRepository: mockRepository }),
      ];

      // ASSERT
      expect(mockMilitaryRankValidator).toHaveBeenCalledTimes(3);
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

    it("should ensure validator implements MilitaryRankValidatorProtocol interface", () => {
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
