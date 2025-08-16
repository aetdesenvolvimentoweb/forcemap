import { makeCreateMilitaryRankController } from "@main/factories/controllers/make-create-military-rank-controller.factory";
import { makeCreateMilitaryRankUseCase } from "@main/factories/usecases";
import { CreateMilitaryRankController } from "@presentation/controllers";
import type { HttpResponseFactory } from "@presentation/factories";
import type { Controller } from "@presentation/protocols";
import type { CreateMilitaryRankInputDTO } from "@domain/dtos";
import type { CreateMilitaryRankUseCase } from "@domain/usecases";

// Mocks
jest.mock("@main/factories/usecases", () => ({
  makeCreateMilitaryRankUseCase: jest.fn(),
}));

jest.mock("@presentation/controllers", () => ({
  CreateMilitaryRankController: jest.fn(),
}));

const mockMakeCreateMilitaryRankUseCase =
  makeCreateMilitaryRankUseCase as jest.MockedFunction<
    typeof makeCreateMilitaryRankUseCase
  >;

const mockCreateMilitaryRankController =
  CreateMilitaryRankController as jest.MockedClass<
    typeof CreateMilitaryRankController
  >;

interface SutTypes {
  sut: typeof makeCreateMilitaryRankController;
  mockHttpResponseFactory: HttpResponseFactory;
  mockUseCase: CreateMilitaryRankUseCase;
  mockController: Controller<CreateMilitaryRankInputDTO, null>;
}

const makeSut = (): SutTypes => {
  const mockHttpResponseFactory = {
    ok: jest.fn(),
    created: jest.fn(),
    badRequest: jest.fn(),
    unauthorized: jest.fn(),
    forbidden: jest.fn(),
    notFound: jest.fn(),
    conflict: jest.fn(),
    serverError: jest.fn(),
  } as unknown as HttpResponseFactory;

  const mockUseCase = {
    create: jest.fn(),
  } as unknown as CreateMilitaryRankUseCase;

  const mockController = {
    handle: jest.fn(),
  } as unknown as Controller<CreateMilitaryRankInputDTO, null>;

  return {
    sut: makeCreateMilitaryRankController,
    mockHttpResponseFactory,
    mockUseCase,
    mockController,
  };
};

describe("makeCreateMilitaryRankController", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock returns
    mockMakeCreateMilitaryRankUseCase.mockReturnValue({
      create: jest.fn(),
    } as unknown as CreateMilitaryRankUseCase);

    mockCreateMilitaryRankController.mockImplementation(
      () =>
        ({
          handle: jest.fn(),
        }) as any,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("factory orchestration", () => {
    it("should call makeCreateMilitaryRankUseCase to create use case", () => {
      // ARRANGE
      const { sut, mockHttpResponseFactory } = makeSut();

      // ACT
      sut({ httpResponseFactory: mockHttpResponseFactory });

      // ASSERT
      expect(mockMakeCreateMilitaryRankUseCase).toHaveBeenCalledTimes(1);
      expect(mockMakeCreateMilitaryRankUseCase).toHaveBeenCalledWith();
    });

    it("should create CreateMilitaryRankController with correct dependencies", () => {
      // ARRANGE
      const { sut, mockHttpResponseFactory } = makeSut();
      const mockUseCase = { create: jest.fn() };
      mockMakeCreateMilitaryRankUseCase.mockReturnValue(mockUseCase as any);

      // ACT
      sut({ httpResponseFactory: mockHttpResponseFactory });

      // ASSERT
      expect(mockCreateMilitaryRankController).toHaveBeenCalledTimes(1);
      expect(mockCreateMilitaryRankController).toHaveBeenCalledWith({
        httpResponseFactory: mockHttpResponseFactory,
        createMilitaryRankService: mockUseCase,
      });
    });

    it("should execute use case creation before controller creation", () => {
      // ARRANGE
      const { sut, mockHttpResponseFactory } = makeSut();
      const callOrder: string[] = [];

      mockMakeCreateMilitaryRankUseCase.mockImplementation(() => {
        callOrder.push("useCase");
        return { create: jest.fn() } as any;
      });

      mockCreateMilitaryRankController.mockImplementation(() => {
        callOrder.push("controller");
        return { handle: jest.fn() } as any;
      });

      // ACT
      sut({ httpResponseFactory: mockHttpResponseFactory });

      // ASSERT
      expect(callOrder).toEqual(["useCase", "controller"]);
    });
  });

  describe("return value", () => {
    it("should return the created controller instance", () => {
      // ARRANGE
      const { sut, mockHttpResponseFactory } = makeSut();
      const mockControllerInstance = { handle: jest.fn() };
      mockCreateMilitaryRankController.mockReturnValue(
        mockControllerInstance as any,
      );

      // ACT
      const result = sut({ httpResponseFactory: mockHttpResponseFactory });

      // ASSERT
      expect(result).toBe(mockControllerInstance);
    });

    it("should return a Controller with correct generic types", () => {
      // ARRANGE
      const { sut, mockHttpResponseFactory } = makeSut();

      // ACT
      const result = sut({ httpResponseFactory: mockHttpResponseFactory });

      // ASSERT
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(typeof result.handle).toBe("function");
    });
  });

  describe("function signature", () => {
    it("should be a function named makeCreateMilitaryRankController", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ASSERT
      expect(sut.name).toBe("makeCreateMilitaryRankController");
      expect(typeof sut).toBe("function");
    });

    it("should accept props parameter with httpResponseFactory", () => {
      // ARRANGE
      const { sut, mockHttpResponseFactory } = makeSut();

      // ACT & ASSERT
      expect(() =>
        sut({ httpResponseFactory: mockHttpResponseFactory }),
      ).not.toThrow();
      expect(sut.length).toBe(1);
    });

    it("should return Controller type", () => {
      // ARRANGE
      const { sut, mockHttpResponseFactory } = makeSut();

      // ACT
      const result = sut({ httpResponseFactory: mockHttpResponseFactory });

      // ASSERT
      expect(result).toBeDefined();
      expect(typeof result.handle).toBe("function");
    });
  });

  describe("dependency injection", () => {
    it("should inject httpResponseFactory into controller", () => {
      // ARRANGE
      const { sut, mockHttpResponseFactory } = makeSut();

      // ACT
      sut({ httpResponseFactory: mockHttpResponseFactory });

      // ASSERT
      expect(mockCreateMilitaryRankController).toHaveBeenCalledWith(
        expect.objectContaining({
          httpResponseFactory: mockHttpResponseFactory,
        }),
      );
    });

    it("should inject use case as createMilitaryRankService", () => {
      // ARRANGE
      const { sut, mockHttpResponseFactory } = makeSut();
      const mockUseCase = { create: jest.fn() };
      mockMakeCreateMilitaryRankUseCase.mockReturnValue(mockUseCase as any);

      // ACT
      sut({ httpResponseFactory: mockHttpResponseFactory });

      // ASSERT
      expect(mockCreateMilitaryRankController).toHaveBeenCalledWith(
        expect.objectContaining({
          createMilitaryRankService: mockUseCase,
        }),
      );
    });

    it("should work with different HttpResponseFactory implementations", () => {
      // ARRANGE
      const { sut } = makeSut();
      const customHttpResponseFactory = {
        created: jest.fn(),
        badRequest: jest.fn(),
        serverError: jest.fn(),
        customMethod: jest.fn(),
      } as unknown as HttpResponseFactory;

      // ACT
      sut({ httpResponseFactory: customHttpResponseFactory });

      // ASSERT
      expect(mockCreateMilitaryRankController).toHaveBeenCalledWith(
        expect.objectContaining({
          httpResponseFactory: customHttpResponseFactory,
        }),
      );
    });
  });

  describe("error handling", () => {
    it("should handle makeCreateMilitaryRankUseCase errors gracefully", () => {
      // ARRANGE
      const { sut, mockHttpResponseFactory } = makeSut();
      mockMakeCreateMilitaryRankUseCase.mockImplementation(() => {
        throw new Error("Use case creation error");
      });

      // ACT & ASSERT
      expect(() =>
        sut({ httpResponseFactory: mockHttpResponseFactory }),
      ).toThrow("Use case creation error");
    });

    it("should handle CreateMilitaryRankController constructor errors gracefully", () => {
      // ARRANGE
      const { sut, mockHttpResponseFactory } = makeSut();
      mockCreateMilitaryRankController.mockImplementation(() => {
        throw new Error("Controller constructor error");
      });

      // ACT & ASSERT
      expect(() =>
        sut({ httpResponseFactory: mockHttpResponseFactory }),
      ).toThrow("Controller constructor error");
      expect(mockMakeCreateMilitaryRankUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete factory flow", () => {
      // ARRANGE
      const { sut, mockHttpResponseFactory } = makeSut();
      const mockUseCase = { create: jest.fn() };
      const mockControllerInstance = { handle: jest.fn() };

      mockMakeCreateMilitaryRankUseCase.mockReturnValue(mockUseCase as any);
      mockCreateMilitaryRankController.mockReturnValue(
        mockControllerInstance as any,
      );

      // ACT
      const result = sut({ httpResponseFactory: mockHttpResponseFactory });

      // ASSERT
      expect(mockMakeCreateMilitaryRankUseCase).toHaveBeenCalledTimes(1);
      expect(mockCreateMilitaryRankController).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockControllerInstance);
    });

    it("should create independent controller instances on multiple calls", () => {
      // ARRANGE
      const { sut, mockHttpResponseFactory } = makeSut();
      const mockController1 = { handle: jest.fn() };
      const mockController2 = { handle: jest.fn() };

      mockCreateMilitaryRankController
        .mockReturnValueOnce(mockController1 as any)
        .mockReturnValueOnce(mockController2 as any);

      // ACT
      const result1 = sut({ httpResponseFactory: mockHttpResponseFactory });
      const result2 = sut({ httpResponseFactory: mockHttpResponseFactory });

      // ASSERT
      expect(result1).toBe(mockController1);
      expect(result2).toBe(mockController2);
      expect(mockMakeCreateMilitaryRankUseCase).toHaveBeenCalledTimes(2);
      expect(mockCreateMilitaryRankController).toHaveBeenCalledTimes(2);
    });

    it("should maintain factory isolation between calls", () => {
      // ARRANGE
      const { sut } = makeSut();
      const factory1 = { created: jest.fn() } as unknown as HttpResponseFactory;
      const factory2 = { created: jest.fn() } as unknown as HttpResponseFactory;

      // ACT
      sut({ httpResponseFactory: factory1 });
      sut({ httpResponseFactory: factory2 });

      // ASSERT
      expect(mockCreateMilitaryRankController).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ httpResponseFactory: factory1 }),
      );
      expect(mockCreateMilitaryRankController).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ httpResponseFactory: factory2 }),
      );
    });
  });
});
