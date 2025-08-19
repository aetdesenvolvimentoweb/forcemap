import { MilitaryRank } from "@domain/entities";
import { AppError } from "@domain/errors";
import { ListAllMilitaryRankUseCase } from "@domain/usecases";
import { ListAllMilitaryRankController } from "@presentation/controllers";

import { HttpResponseFactory } from "@presentation/factories";
import type { HttpRequest, HttpResponse } from "@presentation/protocols";

describe("ListAllMilitaryRankController", () => {
  let controller: ListAllMilitaryRankController;
  let httpResponseFactory: jest.Mocked<HttpResponseFactory>;
  let listAllMilitaryRankService: jest.Mocked<ListAllMilitaryRankUseCase>;
  let httpRequest: HttpRequest<null>;

  const mockMilitaryRanks: MilitaryRank[] = [
    {
      id: "123e4567-e89b-12d3-a456-426614174001",
      abbreviation: "GEN",
      order: 1,
    },
    {
      id: "123e4567-e89b-12d3-a456-426614174002",
      abbreviation: "CEL",
      order: 2,
    },
  ];

  beforeEach(() => {
    httpResponseFactory = {
      ok: jest.fn(),
      badRequest: jest.fn(),
      serverError: jest.fn(),
      created: jest.fn(),
    } as jest.Mocked<HttpResponseFactory>;

    listAllMilitaryRankService = {
      listAll: jest.fn(),
    } as jest.Mocked<ListAllMilitaryRankUseCase>;

    controller = new ListAllMilitaryRankController({
      httpResponseFactory,
      listAllMilitaryRankService,
    });

    httpRequest = {
      body: {},
    } as HttpRequest<null>;
  });

  describe("Successful listing", () => {
    it("should return 200 with military ranks when service returns data", async () => {
      // Arrange
      const expectedResponse: HttpResponse<MilitaryRank[]> = {
        statusCode: 200,
        body: { data: mockMilitaryRanks },
      };

      listAllMilitaryRankService.listAll.mockResolvedValue(mockMilitaryRanks);
      httpResponseFactory.ok.mockReturnValue(expectedResponse);

      // Act
      const result = await controller.handle(httpRequest);

      // Assert
      expect(listAllMilitaryRankService.listAll).toHaveBeenCalledTimes(1);
      expect(listAllMilitaryRankService.listAll).toHaveBeenCalledWith();
      expect(httpResponseFactory.ok).toHaveBeenCalledTimes(1);
      expect(httpResponseFactory.ok).toHaveBeenCalledWith(mockMilitaryRanks);
      expect(result).toEqual(expectedResponse);
    });

    it("should return 200 with empty array when no military ranks exist", async () => {
      // Arrange
      const emptyArray: MilitaryRank[] = [];
      const expectedResponse: HttpResponse<MilitaryRank[]> = {
        statusCode: 200,
        body: { data: emptyArray },
      };

      listAllMilitaryRankService.listAll.mockResolvedValue(emptyArray);
      httpResponseFactory.ok.mockReturnValue(expectedResponse);

      // Act
      const result = await controller.handle(httpRequest);

      // Assert
      expect(listAllMilitaryRankService.listAll).toHaveBeenCalledTimes(1);
      expect(httpResponseFactory.ok).toHaveBeenCalledWith(emptyArray);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("Error handling", () => {
    it("should return client error when service throws AppError", async () => {
      // Arrange
      const appError = new AppError("Repository connection failed", 503);
      const expectedResponse: HttpResponse<MilitaryRank[]> = {
        statusCode: 503,
        body: { error: appError.message },
      };

      listAllMilitaryRankService.listAll.mockRejectedValue(appError);
      httpResponseFactory.badRequest.mockReturnValue(expectedResponse);

      // Act
      const result = await controller.handle(httpRequest);

      // Assert
      expect(listAllMilitaryRankService.listAll).toHaveBeenCalledTimes(1);
      expect(httpResponseFactory.badRequest).toHaveBeenCalledTimes(1);
      expect(httpResponseFactory.badRequest).toHaveBeenCalledWith(appError);
      expect(httpResponseFactory.serverError).not.toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it("should return 500 when service throws unexpected error", async () => {
      // Arrange
      const unexpectedError = new Error("Database connection timeout");
      const expectedResponse: HttpResponse<MilitaryRank[]> = {
        statusCode: 500,
        body: { error: "Erro interno no servidor." },
      };

      listAllMilitaryRankService.listAll.mockRejectedValue(unexpectedError);
      httpResponseFactory.serverError.mockReturnValue(expectedResponse);

      // Act
      const result = await controller.handle(httpRequest);

      // Assert
      expect(listAllMilitaryRankService.listAll).toHaveBeenCalledTimes(1);
      expect(httpResponseFactory.serverError).toHaveBeenCalledTimes(1);
      expect(httpResponseFactory.serverError).toHaveBeenCalledWith();
      expect(httpResponseFactory.badRequest).not.toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it("should handle service throwing non-Error objects", async () => {
      // Arrange
      const nonErrorObject = { message: "Something went wrong", code: 123 };
      const expectedResponse: HttpResponse<MilitaryRank[]> = {
        statusCode: 500,
        body: { error: "Erro interno no servidor." },
      };

      listAllMilitaryRankService.listAll.mockRejectedValue(nonErrorObject);
      httpResponseFactory.serverError.mockReturnValue(expectedResponse);

      // Act
      const result = await controller.handle(httpRequest);

      // Assert
      expect(listAllMilitaryRankService.listAll).toHaveBeenCalledTimes(1);
      expect(httpResponseFactory.serverError).toHaveBeenCalledTimes(1);
      expect(httpResponseFactory.badRequest).not.toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("Controller interface compliance", () => {
    it("should implement Controller interface correctly", () => {
      // Assert
      expect(controller).toHaveProperty("handle");
      expect(typeof controller.handle).toBe("function");
      expect(controller.handle).toBeInstanceOf(Function);
    });

    it("should accept HttpRequest<null> and return Promise<HttpResponse<MilitaryRank[]>>", async () => {
      // Arrange
      listAllMilitaryRankService.listAll.mockResolvedValue([]);
      httpResponseFactory.ok.mockReturnValue({
        statusCode: 200,
        body: { data: [] },
      });

      // Act
      const result = controller.handle(httpRequest);

      // Assert
      expect(result).toBeInstanceOf(Promise);
      const resolvedResult = await result;
      expect(resolvedResult).toHaveProperty("statusCode");
      expect(typeof resolvedResult.statusCode).toBe("number");
    });

    it("should not use httpRequest parameter (marked as unused with _)", async () => {
      // Arrange
      listAllMilitaryRankService.listAll.mockResolvedValue(mockMilitaryRanks);
      httpResponseFactory.ok.mockReturnValue({
        statusCode: 200,
        body: { data: mockMilitaryRanks },
      });

      // Act - httpRequest is not used in the implementation, only required by interface
      await controller.handle(httpRequest);

      // Assert - Service should be called without any parameters from httpRequest
      expect(listAllMilitaryRankService.listAll).toHaveBeenCalledWith();
    });
  });

  describe("Dependency injection", () => {
    it("should use injected httpResponseFactory", async () => {
      // Arrange
      listAllMilitaryRankService.listAll.mockResolvedValue(mockMilitaryRanks);

      // Act
      await controller.handle(httpRequest);

      // Assert
      expect(httpResponseFactory.ok).toHaveBeenCalled();
    });

    it("should use injected listAllMilitaryRankService", async () => {
      // Arrange
      listAllMilitaryRankService.listAll.mockResolvedValue(mockMilitaryRanks);
      httpResponseFactory.ok.mockReturnValue({
        statusCode: 200,
        body: { data: mockMilitaryRanks },
      });

      // Act
      await controller.handle(httpRequest);

      // Assert
      expect(listAllMilitaryRankService.listAll).toHaveBeenCalled();
    });
  });

  describe("Generic type usage", () => {
    it("should call badRequest with correct generic type", async () => {
      // Arrange
      const appError = new AppError("Test error", 400);
      listAllMilitaryRankService.listAll.mockRejectedValue(appError);

      // Act
      await controller.handle(httpRequest);

      // Assert
      expect(httpResponseFactory.badRequest).toHaveBeenCalledWith(appError);
      // Note: TypeScript ensures the generic type <MilitaryRank[]> is applied at compile time
    });

    it("should call serverError with correct generic type", async () => {
      // Arrange
      const unexpectedError = new Error("Unexpected error");
      listAllMilitaryRankService.listAll.mockRejectedValue(unexpectedError);

      // Act
      await controller.handle(httpRequest);

      // Assert
      expect(httpResponseFactory.serverError).toHaveBeenCalledWith();
      // Note: TypeScript ensures the generic type <MilitaryRank[]> is applied at compile time
    });
  });
});
