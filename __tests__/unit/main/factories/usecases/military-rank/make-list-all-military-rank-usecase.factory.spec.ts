import { ListAllMilitaryRankService } from "@application/services";

import { ListAllMilitaryRankUseCase } from "@domain/usecases";

import { makeMilitaryRankRepository } from "@main/factories/repositories";

import { makeListAllMilitaryRankUseCase } from "@main/factories/usecases/military-rank";

// Mocks
jest.mock("@application/services", () => ({
  ListAllMilitaryRankService: jest.fn(),
}));

jest.mock;

jest.mock("@main/factories/repositories", () => ({
  makeMilitaryRankRepository: jest.fn(),
}));

describe("makeListAllMilitaryRankUseCase", () => {
  let MockListAllMilitaryRankService: jest.MockedClass<
    typeof ListAllMilitaryRankService
  >;
  let mockMakeMilitaryRankRepository: jest.MockedFunction<
    typeof makeMilitaryRankRepository
  >;
  let mockRepository: any;
  let mockService: jest.Mocked<ListAllMilitaryRankService>;

  beforeEach(() => {
    MockListAllMilitaryRankService =
      ListAllMilitaryRankService as jest.MockedClass<
        typeof ListAllMilitaryRankService
      >;
    mockMakeMilitaryRankRepository =
      makeMilitaryRankRepository as jest.MockedFunction<
        typeof makeMilitaryRankRepository
      >;

    mockRepository = {
      listAll: jest.fn(),
      create: jest.fn(),
      findByAbbreviation: jest.fn(),
      findByOrder: jest.fn(),
    };

    mockService = {
      listAll: jest.fn(),
    } as unknown as jest.Mocked<ListAllMilitaryRankService>;

    mockMakeMilitaryRankRepository.mockReturnValue(mockRepository);
    MockListAllMilitaryRankService.mockReturnValue(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("dependency creation and injection", () => {
    it("should call makeMilitaryRankRepository to create repository", () => {
      // Act
      makeListAllMilitaryRankUseCase();

      // Assert
      expect(mockMakeMilitaryRankRepository).toHaveBeenCalledTimes(1);
      expect(mockMakeMilitaryRankRepository).toHaveBeenCalledWith();
    });

    it("should inject repository into ListAllMilitaryRankService constructor", () => {
      // Act
      makeListAllMilitaryRankUseCase();

      // Assert
      expect(MockListAllMilitaryRankService).toHaveBeenCalledTimes(1);
      expect(MockListAllMilitaryRankService).toHaveBeenCalledWith({
        militaryRankRepository: mockRepository,
      });
    });

    it("should return ListAllMilitaryRankService instance", () => {
      // Act
      const result = makeListAllMilitaryRankUseCase();

      // Assert
      expect(result).toBe(mockService);
    });

    it("should execute repository creation before service creation", () => {
      // Arrange
      const callOrder: string[] = [];
      mockMakeMilitaryRankRepository.mockImplementation(() => {
        callOrder.push("repository");
        return mockRepository;
      });
      MockListAllMilitaryRankService.mockImplementation((props) => {
        callOrder.push("service");
        return mockService;
      });

      // Act
      makeListAllMilitaryRankUseCase();

      // Assert
      expect(callOrder).toEqual(["repository", "service"]);
    });
  });

  describe("function signature", () => {
    it("should be a function named makeListAllMilitaryRankUseCase", () => {
      // Assert
      expect(makeListAllMilitaryRankUseCase).toBeInstanceOf(Function);
      expect(makeListAllMilitaryRankUseCase.name).toBe(
        "makeListAllMilitaryRankUseCase",
      );
    });

    it("should accept no parameters", () => {
      // Assert
      expect(makeListAllMilitaryRankUseCase.length).toBe(0);
    });

    it("should return ListAllMilitaryRankUseCase type", () => {
      // Act
      const result = makeListAllMilitaryRankUseCase();

      // Assert
      expect(result).toHaveProperty("listAll");
      expect(typeof result.listAll).toBe("function");
    });
  });

  describe("error handling", () => {
    it("should handle makeMilitaryRankRepository errors gracefully", () => {
      // Arrange
      const repositoryError = new Error("Repository creation failed");
      mockMakeMilitaryRankRepository.mockImplementation(() => {
        throw repositoryError;
      });

      // Act & Assert
      expect(() => makeListAllMilitaryRankUseCase()).toThrow(
        "Repository creation failed",
      );
      expect(MockListAllMilitaryRankService).not.toHaveBeenCalled();
    });

    it("should handle ListAllMilitaryRankService constructor errors gracefully", () => {
      // Arrange
      const serviceError = new Error("Service instantiation failed");
      MockListAllMilitaryRankService.mockImplementation((props) => {
        throw serviceError;
      });

      // Act & Assert
      expect(() => makeListAllMilitaryRankUseCase()).toThrow(
        "Service instantiation failed",
      );
      expect(mockMakeMilitaryRankRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe("dependency injection order", () => {
    it("should create dependencies in correct order", () => {
      // Arrange
      const executionOrder: string[] = [];
      mockMakeMilitaryRankRepository.mockImplementation(() => {
        executionOrder.push("makeMilitaryRankRepository");
        return mockRepository;
      });
      MockListAllMilitaryRankService.mockImplementation((props) => {
        executionOrder.push("ListAllMilitaryRankService");
        return mockService;
      });

      // Act
      makeListAllMilitaryRankUseCase();

      // Assert
      expect(executionOrder).toEqual([
        "makeMilitaryRankRepository",
        "ListAllMilitaryRankService",
      ]);
    });

    it("should ensure repository is available before service creation", () => {
      // Arrange
      let repositoryCreated = false;
      mockMakeMilitaryRankRepository.mockImplementation(() => {
        repositoryCreated = true;
        return mockRepository;
      });
      MockListAllMilitaryRankService.mockImplementation((props) => {
        expect(repositoryCreated).toBe(true);
        return mockService;
      });

      // Act
      makeListAllMilitaryRankUseCase();

      // Assert
      expect(repositoryCreated).toBe(true);
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete factory chain", () => {
      // Act
      const result = makeListAllMilitaryRankUseCase();

      // Assert
      expect(mockMakeMilitaryRankRepository).toHaveBeenCalledTimes(1);
      expect(MockListAllMilitaryRankService).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockService);
    });

    it("should create new instances on each call", () => {
      // Act
      const result1 = makeListAllMilitaryRankUseCase();
      const result2 = makeListAllMilitaryRankUseCase();

      // Assert
      expect(mockMakeMilitaryRankRepository).toHaveBeenCalledTimes(2);
      expect(MockListAllMilitaryRankService).toHaveBeenCalledTimes(2);
      expect(result1).toBe(mockService);
      expect(result2).toBe(mockService);
    });

    it("should maintain factory isolation", () => {
      // Act
      makeListAllMilitaryRankUseCase();
      jest.clearAllMocks();
      makeListAllMilitaryRankUseCase();

      // Assert
      expect(mockMakeMilitaryRankRepository).toHaveBeenCalledTimes(1);
      expect(MockListAllMilitaryRankService).toHaveBeenCalledTimes(1);
    });
  });

  describe("usecase interface compliance", () => {
    it("should return object implementing ListAllMilitaryRankUseCase interface", () => {
      // Act
      const result = makeListAllMilitaryRankUseCase();

      // Assert
      expect(result).toHaveProperty("listAll");
      expect(typeof result.listAll).toBe("function");
    });

    it("should ensure service has listAll method", () => {
      // Act
      const result = makeListAllMilitaryRankUseCase();

      // Assert
      expect(result.listAll).toBeDefined();
      expect(typeof result.listAll).toBe("function");
    });
  });

  describe("repository integration", () => {
    it("should use the same repository instance throughout factory execution", () => {
      // Act
      makeListAllMilitaryRankUseCase();

      // Assert
      expect(mockMakeMilitaryRankRepository).toHaveBeenCalledTimes(1);
      expect(MockListAllMilitaryRankService).toHaveBeenCalledWith({
        militaryRankRepository: mockRepository,
      });
    });

    it("should work with different repository implementations", () => {
      // Arrange
      const alternativeRepository = {
        listAll: jest.fn(),
        create: jest.fn(),
        findByAbbreviation: jest.fn(),
        findByOrder: jest.fn(),
        listById: jest.fn(),
      };
      mockMakeMilitaryRankRepository.mockReturnValue(alternativeRepository);

      // Act
      makeListAllMilitaryRankUseCase();

      // Assert
      expect(MockListAllMilitaryRankService).toHaveBeenCalledWith({
        militaryRankRepository: alternativeRepository,
      });
    });
  });
});
