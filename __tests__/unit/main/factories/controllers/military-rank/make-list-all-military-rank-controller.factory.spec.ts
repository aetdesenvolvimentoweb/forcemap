import { makeListAllMilitaryRankController } from "@main/factories/controllers/military-rank/make-list-all-military-rank-controller.factory";
import { makeListAllMilitaryRankUseCase } from "@main/factories/usecases";
import { ListAllMilitaryRankController } from "@presentation/controllers";
import type { HttpResponseFactory } from "@presentation/factories";
import type { Controller } from "@presentation/protocols";
import type { MilitaryRank } from "@domain/entities";

// Mock das dependências
jest.mock("@main/factories/usecases");
jest.mock("@presentation/controllers");

describe("makeListAllMilitaryRankController", () => {
  let mockHttpResponseFactory: jest.Mocked<HttpResponseFactory>;
  let mockUseCase: any;
  let mockController: jest.Mocked<Controller<null, MilitaryRank[]>>;

  beforeEach(() => {
    // Setup mock HttpResponseFactory
    mockHttpResponseFactory = {
      created: jest.fn(),
      badRequest: jest.fn(),
      serverError: jest.fn(),
      ok: jest.fn(),
    } as unknown as jest.Mocked<HttpResponseFactory>;

    // Setup mock UseCase
    mockUseCase = {
      execute: jest.fn(),
    };

    // Setup mock Controller
    mockController = {
      handle: jest.fn(),
      props: {} as any,
    } as unknown as jest.Mocked<Controller<null, MilitaryRank[]>>;

    // Mock makeListAllMilitaryRankUseCase to return our mock use case
    (makeListAllMilitaryRankUseCase as jest.Mock).mockReturnValue(mockUseCase);

    // Mock ListAllMilitaryRankController constructor
    (
      ListAllMilitaryRankController as jest.MockedClass<
        typeof ListAllMilitaryRankController
      >
    ).mockImplementation(
      () => mockController as unknown as ListAllMilitaryRankController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("factory orchestration", () => {
    it("should call makeListAllMilitaryRankUseCase to create use case", () => {
      // Act
      makeListAllMilitaryRankController({
        httpResponseFactory: mockHttpResponseFactory,
      });

      // Assert
      expect(makeListAllMilitaryRankUseCase).toHaveBeenCalledTimes(1);
      expect(makeListAllMilitaryRankUseCase).toHaveBeenCalledWith();
    });

    it("should create ListAllMilitaryRankController with correct dependencies", () => {
      // Act
      makeListAllMilitaryRankController({
        httpResponseFactory: mockHttpResponseFactory,
      });

      // Assert
      expect(ListAllMilitaryRankController).toHaveBeenCalledTimes(1);
      expect(ListAllMilitaryRankController).toHaveBeenCalledWith({
        httpResponseFactory: mockHttpResponseFactory,
        listAllMilitaryRankService: mockUseCase,
      });
    });

    it("should execute use case creation before controller creation", () => {
      // Arrange
      let useCaseCallOrder = 0;
      let controllerCallOrder = 0;
      let callCounter = 0;

      (makeListAllMilitaryRankUseCase as jest.Mock).mockImplementation(() => {
        useCaseCallOrder = ++callCounter;
        return mockUseCase;
      });

      (
        ListAllMilitaryRankController as jest.MockedClass<
          typeof ListAllMilitaryRankController
        >
      ).mockImplementation(() => {
        controllerCallOrder = ++callCounter;
        return mockController as unknown as ListAllMilitaryRankController;
      });

      // Act
      makeListAllMilitaryRankController({
        httpResponseFactory: mockHttpResponseFactory,
      });

      // Assert
      expect(useCaseCallOrder).toBeLessThan(controllerCallOrder);
      expect(useCaseCallOrder).toBe(1);
      expect(controllerCallOrder).toBe(2);
    });
  });

  describe("return value", () => {
    it("should return the created controller instance", () => {
      // Act
      const result = makeListAllMilitaryRankController({
        httpResponseFactory: mockHttpResponseFactory,
      });

      // Assert
      expect(result).toBe(mockController);
    });

    it("should return a Controller with correct generic types", () => {
      // Act
      const result = makeListAllMilitaryRankController({
        httpResponseFactory: mockHttpResponseFactory,
      });

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          handle: expect.any(Function),
        }),
      );
    });
  });

  describe("function signature", () => {
    it("should be a function named makeListAllMilitaryRankController", () => {
      // Assert
      expect(typeof makeListAllMilitaryRankController).toBe("function");
      expect(makeListAllMilitaryRankController.name).toBe(
        "makeListAllMilitaryRankController",
      );
    });

    it("should accept props parameter with httpResponseFactory", () => {
      // Assert
      expect(makeListAllMilitaryRankController.length).toBe(1);

      // Verify it accepts the correct parameter structure
      expect(() => {
        makeListAllMilitaryRankController({
          httpResponseFactory: mockHttpResponseFactory,
        });
      }).not.toThrow();
    });

    it("should return Controller type", () => {
      // Act
      const result = makeListAllMilitaryRankController({
        httpResponseFactory: mockHttpResponseFactory,
      });

      // Assert - Check if it has the Controller interface
      expect(result).toHaveProperty("handle");
      expect(typeof result.handle).toBe("function");
    });
  });

  describe("dependency injection", () => {
    it("should inject httpResponseFactory into controller", () => {
      // Act
      makeListAllMilitaryRankController({
        httpResponseFactory: mockHttpResponseFactory,
      });

      // Assert
      const constructorCall = (
        ListAllMilitaryRankController as jest.MockedClass<
          typeof ListAllMilitaryRankController
        >
      ).mock.calls[0];
      expect(constructorCall).toBeDefined();
      expect(constructorCall?.[0]).toHaveProperty(
        "httpResponseFactory",
        mockHttpResponseFactory,
      );
    });

    it("should inject use case as listAllMilitaryRankService", () => {
      // Act
      makeListAllMilitaryRankController({
        httpResponseFactory: mockHttpResponseFactory,
      });

      // Assert
      const constructorCall = (
        ListAllMilitaryRankController as jest.MockedClass<
          typeof ListAllMilitaryRankController
        >
      ).mock.calls[0];
      expect(constructorCall).toBeDefined();
      expect(constructorCall?.[0]).toHaveProperty(
        "listAllMilitaryRankService",
        mockUseCase,
      );
    });

    it("should work with different HttpResponseFactory implementations", () => {
      // Arrange
      const alternativeHttpResponseFactory = {
        created: jest.fn().mockReturnValue({ statusCode: 201, body: {} }),
        badRequest: jest.fn().mockReturnValue({ statusCode: 400, body: {} }),
        serverError: jest.fn().mockReturnValue({ statusCode: 500, body: {} }),
        ok: jest.fn().mockReturnValue({ statusCode: 200, body: {} }),
      } as unknown as jest.Mocked<HttpResponseFactory>;

      // Act
      makeListAllMilitaryRankController({
        httpResponseFactory: alternativeHttpResponseFactory,
      });

      // Assert
      const constructorCall = (
        ListAllMilitaryRankController as jest.MockedClass<
          typeof ListAllMilitaryRankController
        >
      ).mock.calls[0];
      expect(constructorCall).toBeDefined();
      expect(constructorCall?.[0]).toHaveProperty(
        "httpResponseFactory",
        alternativeHttpResponseFactory,
      );
    });
  });

  describe("error handling", () => {
    it("should handle makeListAllMilitaryRankUseCase errors gracefully", () => {
      // Arrange
      const error = new Error("UseCase factory failed");
      (makeListAllMilitaryRankUseCase as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => {
        makeListAllMilitaryRankController({
          httpResponseFactory: mockHttpResponseFactory,
        });
      }).toThrow("UseCase factory failed");
    });

    it("should handle ListAllMilitaryRankController constructor errors gracefully", () => {
      // Arrange
      const error = new Error("Controller constructor failed");
      (
        ListAllMilitaryRankController as jest.MockedClass<
          typeof ListAllMilitaryRankController
        >
      ).mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => {
        makeListAllMilitaryRankController({
          httpResponseFactory: mockHttpResponseFactory,
        });
      }).toThrow("Controller constructor failed");
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete factory flow", () => {
      // Act
      const result = makeListAllMilitaryRankController({
        httpResponseFactory: mockHttpResponseFactory,
      });

      // Assert - Verify complete flow
      expect(makeListAllMilitaryRankUseCase).toHaveBeenCalled();
      expect(ListAllMilitaryRankController).toHaveBeenCalledWith({
        httpResponseFactory: mockHttpResponseFactory,
        listAllMilitaryRankService: mockUseCase,
      });
      expect(result).toBe(mockController);
    });

    it("should create independent controller instances on multiple calls", () => {
      // Arrange
      const mockController2 = {
        handle: jest.fn(),
        props: {} as any,
      } as unknown as jest.Mocked<Controller<null, MilitaryRank[]>>;
      (
        ListAllMilitaryRankController as jest.MockedClass<
          typeof ListAllMilitaryRankController
        >
      )
        .mockReturnValueOnce(
          mockController as unknown as ListAllMilitaryRankController,
        )
        .mockReturnValueOnce(
          mockController2 as unknown as ListAllMilitaryRankController,
        );

      // Act
      const result1 = makeListAllMilitaryRankController({
        httpResponseFactory: mockHttpResponseFactory,
      });
      const result2 = makeListAllMilitaryRankController({
        httpResponseFactory: mockHttpResponseFactory,
      });

      // Assert
      expect(result1).toBe(mockController);
      expect(result2).toBe(mockController2);
      expect(result1).not.toBe(result2);
    });

    it("should maintain factory isolation between calls", () => {
      // Act
      makeListAllMilitaryRankController({
        httpResponseFactory: mockHttpResponseFactory,
      });
      makeListAllMilitaryRankController({
        httpResponseFactory: mockHttpResponseFactory,
      });

      // Assert
      expect(makeListAllMilitaryRankUseCase).toHaveBeenCalledTimes(2);
      expect(ListAllMilitaryRankController).toHaveBeenCalledTimes(2);
    });
  });
});
