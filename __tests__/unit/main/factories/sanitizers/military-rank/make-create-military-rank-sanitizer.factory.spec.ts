import { CreateMilitaryRankSanitizer } from "@application/sanitizers";
import type { CreateMilitaryRankSanitizerProtocol } from "@application/protocols";
import { makeCreateMilitaryRankSanitizer } from "@main/factories";

// Mocks
jest.mock("@application/sanitizers", () => ({
  CreateMilitaryRankSanitizer: jest.fn(),
}));

const mockCreateMilitaryRankSanitizer =
  CreateMilitaryRankSanitizer as jest.MockedClass<
    typeof CreateMilitaryRankSanitizer
  >;

interface SutTypes {
  sut: typeof makeCreateMilitaryRankSanitizer;
  mockSanitizer: CreateMilitaryRankSanitizerProtocol;
}

const makeSut = (): SutTypes => {
  const mockSanitizer = {
    sanitize: jest.fn(),
  } as unknown as CreateMilitaryRankSanitizerProtocol;

  return {
    sut: makeCreateMilitaryRankSanitizer,
    mockSanitizer,
  };
};

describe("makeCreateMilitaryRankSanitizer", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock returns
    mockCreateMilitaryRankSanitizer.mockImplementation(
      () =>
        ({
          sanitize: jest.fn(),
        }) as any,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("sanitizer creation", () => {
    it("should create CreateMilitaryRankSanitizer instance", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      sut();

      // ASSERT
      expect(mockCreateMilitaryRankSanitizer).toHaveBeenCalledTimes(1);
      expect(mockCreateMilitaryRankSanitizer).toHaveBeenCalledWith();
    });

    it("should return CreateMilitaryRankSanitizerProtocol interface", () => {
      // ARRANGE
      const { sut, mockSanitizer } = makeSut();
      mockCreateMilitaryRankSanitizer.mockReturnValue(mockSanitizer as any);

      // ACT
      const result = sut();

      // ASSERT
      expect(result).toBe(mockSanitizer);
      expect(typeof result.sanitize).toBe("function");
    });

    it("should create new instance on each call", () => {
      // ARRANGE
      const { sut } = makeSut();
      const sanitizer1 = { sanitize: jest.fn() };
      const sanitizer2 = { sanitize: jest.fn() };

      mockCreateMilitaryRankSanitizer
        .mockReturnValueOnce(sanitizer1 as any)
        .mockReturnValueOnce(sanitizer2 as any);

      // ACT
      const result1 = sut();
      const result2 = sut();

      // ASSERT
      expect(result1).toBe(sanitizer1);
      expect(result2).toBe(sanitizer2);
      expect(mockCreateMilitaryRankSanitizer).toHaveBeenCalledTimes(2);
    });
  });

  describe("function signature", () => {
    it("should be a function named makeCreateMilitaryRankSanitizer", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ASSERT
      expect(sut.name).toBe("makeCreateMilitaryRankSanitizer");
      expect(typeof sut).toBe("function");
    });

    it("should accept no parameters", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT & ASSERT
      expect(() => sut()).not.toThrow();
      expect(sut.length).toBe(0);
    });

    it("should return CreateMilitaryRankSanitizerProtocol type", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      const result = sut();

      // ASSERT
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(typeof result.sanitize).toBe("function");
    });
  });

  describe("error handling", () => {
    it("should handle CreateMilitaryRankSanitizer constructor errors gracefully", () => {
      // ARRANGE
      const { sut } = makeSut();
      mockCreateMilitaryRankSanitizer.mockImplementation(() => {
        throw new Error("Sanitizer constructor error");
      });

      // ACT & ASSERT
      expect(() => sut()).toThrow("Sanitizer constructor error");
    });

    it("should propagate sanitizer instantiation errors", () => {
      // ARRANGE
      const { sut } = makeSut();
      const customError = new Error("Custom sanitizer error");
      mockCreateMilitaryRankSanitizer.mockImplementation(() => {
        throw customError;
      });

      // ACT & ASSERT
      expect(() => sut()).toThrow(customError);
    });
  });

  describe("instantiation independence", () => {
    it("should maintain factory isolation", () => {
      // ARRANGE
      const { sut } = makeSut();
      const instances: CreateMilitaryRankSanitizerProtocol[] = [];

      // ACT
      for (let i = 0; i < 3; i++) {
        const mockInstance = { sanitize: jest.fn() };
        mockCreateMilitaryRankSanitizer.mockReturnValueOnce(
          mockInstance as any,
        );
        instances.push(sut());
      }

      // ASSERT
      expect(mockCreateMilitaryRankSanitizer).toHaveBeenCalledTimes(3);
      instances.forEach((instance, index) => {
        instances.forEach((otherInstance, otherIndex) => {
          if (index !== otherIndex) {
            expect(instance).not.toBe(otherInstance);
          }
        });
      });
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete sanitizer factory flow", () => {
      // ARRANGE
      const { sut, mockSanitizer } = makeSut();
      mockCreateMilitaryRankSanitizer.mockReturnValue(mockSanitizer as any);

      // ACT
      const result = sut();

      // ASSERT
      expect(mockCreateMilitaryRankSanitizer).toHaveBeenCalledTimes(1);
      expect(mockCreateMilitaryRankSanitizer).toHaveBeenCalledWith();
      expect(result).toBe(mockSanitizer);
    });

    it("should work consistently across multiple invocations", () => {
      // ARRANGE
      const { sut } = makeSut();
      const sanitizers = [
        { sanitize: jest.fn() },
        { sanitize: jest.fn() },
        { sanitize: jest.fn() },
      ];

      sanitizers.forEach((sanitizer) => {
        mockCreateMilitaryRankSanitizer.mockReturnValueOnce(sanitizer as any);
      });

      // ACT
      const results = [sut(), sut(), sut()];

      // ASSERT
      expect(mockCreateMilitaryRankSanitizer).toHaveBeenCalledTimes(3);
      results.forEach((result, index) => {
        expect(result).toBe(sanitizers[index]);
      });
    });

    it("should be ready for dependency injection if needed in future", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      const result = sut();

      // ASSERT
      // Verifica que a factory é simples mas extensível
      expect(result).toBeDefined();
      expect(mockCreateMilitaryRankSanitizer).toHaveBeenCalledWith();
      // No futuro, se dependencies forem necessárias, a interface pode ser mantida
    });
  });

  describe("sanitizer interface compliance", () => {
    it("should return object with sanitize method", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      const result = sut();

      // ASSERT
      expect(typeof result.sanitize).toBe("function");
    });

    it("should ensure sanitizer implements CreateMilitaryRankSanitizerProtocol interface", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      const result = sut();

      // ASSERT
      // Verifica se a instância tem as características esperadas de um sanitizer
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");

      // Método obrigatório da interface
      expect(result.sanitize).toBeDefined();
      expect(typeof result.sanitize).toBe("function");
    });

    it("should maintain consistent interface across all instances", () => {
      // ARRANGE
      const { sut } = makeSut();
      const instances = [];

      // ACT
      for (let i = 0; i < 3; i++) {
        instances.push(sut());
      }

      // ASSERT
      instances.forEach((instance) => {
        expect(typeof instance.sanitize).toBe("function");
      });
    });
  });

  describe("future extensibility", () => {
    it("should be easily extensible for dependency injection", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      const result = sut();

      // ASSERT
      // Atualmente não tem dependências, mas a estrutura permite adicionar facilmente
      expect(mockCreateMilitaryRankSanitizer).toHaveBeenCalledWith();
      expect(result).toBeDefined();

      // Se no futuro precisar de dependencies, a factory pode ser estendida:
      // Example: sut({ someConfig }) → new CreateMilitaryRankSanitizer({ someConfig })
    });

    it("should maintain factory pattern consistency", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      const result = sut();

      // ASSERT
      // Segue o mesmo padrão das outras factories
      expect(typeof sut).toBe("function");
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");

      // Interface consistente
      expect(typeof result.sanitize).toBe("function");
    });
  });
});
