import { setupAllRoutes } from "@main/config/routes";
import { setupMilitaryRankRoutes } from "@main/config/routes";
import type { RouteRegistry } from "@presentation/protocols";

// Mocks
jest.mock("@main/config/routes/military-rank-route.setup", () => ({
  setupMilitaryRankRoutes: jest.fn(),
}));

const mockSetupMilitaryRankRoutes =
  setupMilitaryRankRoutes as jest.MockedFunction<
    typeof setupMilitaryRankRoutes
  >;

interface SutTypes {
  sut: typeof setupAllRoutes;
  mockRouteRegistry: RouteRegistry;
}

const makeSut = (): SutTypes => {
  const mockRouteRegistry = {
    register: jest.fn(),
    getRoutes: jest.fn().mockReturnValue([]), // Default return value
  } as unknown as RouteRegistry;

  return {
    sut: setupAllRoutes,
    mockRouteRegistry,
  };
};

describe("setupAllRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementation for setupMilitaryRankRoutes
    mockSetupMilitaryRankRoutes.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("route setup orchestration", () => {
    it("should call setupMilitaryRankRoutes with RouteRegistry", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      expect(mockSetupMilitaryRankRoutes).toHaveBeenCalledTimes(1);
      expect(mockSetupMilitaryRankRoutes).toHaveBeenCalledWith(
        mockRouteRegistry,
      );
    });

    it("should call getRoutes to count total routes", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();
      const mockRoutes = [
        { method: "POST", path: "/military-ranks", controller: {} },
      ];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(mockRoutes);

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      expect(mockRouteRegistry.getRoutes).toHaveBeenCalledTimes(1);
    });
  });

  describe("execution flow", () => {
    it("should execute setupMilitaryRankRoutes before counting routes", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();
      const callOrder: string[] = [];

      mockSetupMilitaryRankRoutes.mockImplementation(() => {
        callOrder.push("setupMilitaryRankRoutes");
      });

      (mockRouteRegistry.getRoutes as jest.Mock).mockImplementation(() => {
        callOrder.push("getRoutes");
        return [];
      });

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      expect(callOrder).toEqual(["setupMilitaryRankRoutes", "getRoutes"]);
    });

    it("should handle multiple route configurations correctly", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();
      const mockRoutes = [
        { method: "POST", path: "/military-ranks", controller: {} },
        { method: "GET", path: "/military-ranks", controller: {} },
        { method: "PUT", path: "/military-ranks/:id", controller: {} },
      ];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(mockRoutes);

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      expect(mockSetupMilitaryRankRoutes).toHaveBeenCalledTimes(1);
      expect(mockRouteRegistry.getRoutes).toHaveBeenCalledTimes(1);
    });
  });

  describe("function signature", () => {
    it("should be a function named setupAllRoutes", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ASSERT
      expect(sut.name).toBe("setupAllRoutes");
      expect(typeof sut).toBe("function");
    });

    it("should accept RouteRegistry parameter", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();

      // ACT & ASSERT
      expect(() => sut(mockRouteRegistry)).not.toThrow();
      expect(sut.length).toBe(1);
    });

    it("should return void", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();

      // ACT
      const result = sut(mockRouteRegistry);

      // ASSERT
      expect(result).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("should handle RouteRegistry getRoutes method errors gracefully", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();
      (mockRouteRegistry.getRoutes as jest.Mock).mockImplementation(() => {
        throw new Error("Registry error");
      });

      // ACT & ASSERT
      expect(() => sut(mockRouteRegistry)).toThrow("Registry error");
      expect(mockSetupMilitaryRankRoutes).toHaveBeenCalledTimes(1);
    });

    it("should handle setupMilitaryRankRoutes errors gracefully", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();
      mockSetupMilitaryRankRoutes.mockImplementation(() => {
        throw new Error("Military rank setup error");
      });

      // ACT & ASSERT
      expect(() => sut(mockRouteRegistry)).toThrow("Military rank setup error");
    });
  });

  describe("integration scenarios", () => {
    it("should handle RouteRegistry with no existing routes", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue([]);

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      expect(mockSetupMilitaryRankRoutes).toHaveBeenCalledTimes(1);
      expect(mockRouteRegistry.getRoutes).toHaveBeenCalledTimes(1);
    });

    it("should handle RouteRegistry with existing routes", () => {
      // ARRANGE
      const { sut, mockRouteRegistry } = makeSut();
      const existingRoutes = [
        { method: "GET", path: "/health", controller: {} },
      ];
      (mockRouteRegistry.getRoutes as jest.Mock).mockReturnValue(
        existingRoutes,
      );

      // ACT
      sut(mockRouteRegistry);

      // ASSERT
      expect(mockSetupMilitaryRankRoutes).toHaveBeenCalledTimes(1);
      expect(mockSetupMilitaryRankRoutes).toHaveBeenCalledWith(
        mockRouteRegistry,
      );
    });

    it("should work with different RouteRegistry implementations", () => {
      // ARRANGE
      const { sut } = makeSut();
      const customRouteRegistry = {
        register: jest.fn(),
        getRoutes: jest.fn().mockReturnValue([]),
        customMethod: jest.fn(),
      } as unknown as RouteRegistry;

      // ACT
      sut(customRouteRegistry);

      // ASSERT
      expect(mockSetupMilitaryRankRoutes).toHaveBeenCalledTimes(1);
      expect(mockSetupMilitaryRankRoutes).toHaveBeenCalledWith(
        customRouteRegistry,
      );
      expect(customRouteRegistry.getRoutes).toHaveBeenCalledTimes(1);
    });
  });
});
