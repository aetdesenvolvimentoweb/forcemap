import { MilitaryRankInputDTOSanitizer } from "@application/sanitizers";
import type { MilitaryRankInputDTOSanitizerProtocol } from "@application/protocols";
import { makeMilitaryRankInputDTOSanitizer } from "@main/factories";

// Mocks
jest.mock("@application/sanitizers", () => ({
  MilitaryRankInputDTOSanitizer: jest.fn(),
}));

const mockMilitaryRankInputDTOSanitizer =
  MilitaryRankInputDTOSanitizer as jest.MockedClass<
    typeof MilitaryRankInputDTOSanitizer
  >;

interface SutTypes {
  sut: typeof makeMilitaryRankInputDTOSanitizer;
  mockSanitizer: MilitaryRankInputDTOSanitizerProtocol;
}

const makeSut = (): SutTypes => {
  const mockSanitizer = {
    sanitize: jest.fn(),
  } as unknown as MilitaryRankInputDTOSanitizerProtocol;

  return {
    sut: makeMilitaryRankInputDTOSanitizer,
    mockSanitizer,
  };
};

describe("makeMilitaryRankInputDTOSanitizer", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock returns
    mockMilitaryRankInputDTOSanitizer.mockImplementation(
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
    it("should create MilitaryRankInputDTOSanitizer instance", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT
      sut();

      // ASSERT
      expect(mockMilitaryRankInputDTOSanitizer).toHaveBeenCalledTimes(1);
      expect(mockMilitaryRankInputDTOSanitizer).toHaveBeenCalledWith();
    });

    it("should return MilitaryRankInputDTOSanitizerProtocol interface", () => {
      // ARRANGE
      const { sut, mockSanitizer } = makeSut();
      mockMilitaryRankInputDTOSanitizer.mockReturnValue(mockSanitizer as any);

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

      mockMilitaryRankInputDTOSanitizer
        .mockReturnValueOnce(sanitizer1 as any)
        .mockReturnValueOnce(sanitizer2 as any);

      // ACT
      const result1 = sut();
      const result2 = sut();

      // ASSERT
      expect(result1).toBe(sanitizer1);
      expect(result2).toBe(sanitizer2);
      expect(mockMilitaryRankInputDTOSanitizer).toHaveBeenCalledTimes(2);
    });
  });

  describe("function signature", () => {
    it("should be a function named makeMilitaryRankInputDTOSanitizer", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ASSERT
      expect(sut.name).toBe("makeMilitaryRankInputDTOSanitizer");
      expect(typeof sut).toBe("function");
    });

    it("should accept no parameters", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ACT & ASSERT
      expect(() => sut()).not.toThrow();
      expect(sut.length).toBe(0);
    });

    it("should return MilitaryRankInputDTOSanitizerProtocol type", () => {
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
    it("should handle MilitaryRankInputDTOSanitizer constructor errors gracefully", () => {
      // ARRANGE
      const { sut } = makeSut();
      mockMilitaryRankInputDTOSanitizer.mockImplementation(() => {
        throw new Error("Sanitizer constructor error");
      });

      // ACT & ASSERT
      expect(() => sut()).toThrow("Sanitizer constructor error");
    });

    it("should propagate sanitizer instantiation errors", () => {
      // ARRANGE
      const { sut } = makeSut();
      const customError = new Error("Custom sanitizer error");
      mockMilitaryRankInputDTOSanitizer.mockImplementation(() => {
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
      const instances: MilitaryRankInputDTOSanitizerProtocol[] = [];

      // ACT
      for (let i = 0; i < 3; i++) {
        const mockInstance = { sanitize: jest.fn() };
        mockMilitaryRankInputDTOSanitizer.mockReturnValueOnce(
          mockInstance as any,
        );
        instances.push(sut());
      }

      // ASSERT
      expect(mockMilitaryRankInputDTOSanitizer).toHaveBeenCalledTimes(3);
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
      mockMilitaryRankInputDTOSanitizer.mockReturnValue(mockSanitizer as any);

      // ACT
      const result = sut();

      // ASSERT
      expect(mockMilitaryRankInputDTOSanitizer).toHaveBeenCalledTimes(1);
      expect(mockMilitaryRankInputDTOSanitizer).toHaveBeenCalledWith();
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
        mockMilitaryRankInputDTOSanitizer.mockReturnValueOnce(sanitizer as any);
      });

      // ACT
      const results = [sut(), sut(), sut()];

      // ASSERT
      expect(mockMilitaryRankInputDTOSanitizer).toHaveBeenCalledTimes(3);
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
      expect(mockMilitaryRankInputDTOSanitizer).toHaveBeenCalledWith();
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

    it("should ensure sanitizer implements MilitaryRankInputDTOSanitizerProtocol interface", () => {
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
      expect(mockMilitaryRankInputDTOSanitizer).toHaveBeenCalledWith();
      expect(result).toBeDefined();

      // Se no futuro precisar de dependencies, a factory pode ser estendida:
      // Example: sut({ someConfig }) → new MilitaryRankInputDTOSanitizer({ someConfig })
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
