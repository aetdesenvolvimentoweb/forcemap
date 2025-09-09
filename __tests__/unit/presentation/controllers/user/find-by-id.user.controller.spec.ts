import { mockFindByIdUserService, mockLogger } from "../../../../../__mocks__";
import { EntityNotFoundError } from "../../../../../src/application/errors";
import { UserOutputDTO } from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";
import { FindByIdUserController } from "../../../../../src/presentation/controllers";
import { HttpRequest } from "../../../../../src/presentation/protocols";

describe("FindByIdUserController", () => {
  let sut: FindByIdUserController;
  let mockedService = mockFindByIdUserService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new FindByIdUserController({
      findByIdUserService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const mockUser: UserOutputDTO = {
      id: "user-123",
      role: UserRole.ADMIN,
      military: {
        id: "military-456",
        militaryRank: { id: "rank-789", abbreviation: "CAP", order: 6 },
        rg: 12345678,
        name: "João da Silva",
      },
    };

    const validRequest: HttpRequest = {
      params: { id: "user-123" },
    };

    it("should find user by id successfully", async () => {
      mockedService.findById.mockResolvedValueOnce(mockUser);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: mockUser },
      });
      expect(mockedService.findById).toHaveBeenCalledWith("user-123");
      expect(mockedService.findById).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request", async () => {
      mockedService.findById.mockResolvedValueOnce(mockUser);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para listar usuário por ID",
        { params: validRequest.params },
      );
    });

    it("should log info when user is found successfully", async () => {
      mockedService.findById.mockResolvedValueOnce(mockUser);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuário encontrado com sucesso",
        {
          id: "user-123",
          found: true,
        },
      );
    });

    it("should return user as null when not found", async () => {
      mockedService.findById.mockResolvedValueOnce(null);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: null },
      });
      expect(mockedService.findById).toHaveBeenCalledWith("user-123");
    });

    it("should log info when user is not found", async () => {
      mockedService.findById.mockResolvedValueOnce(null);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuário encontrado com sucesso",
        {
          id: "user-123",
          found: false,
        },
      );
    });

    it("should return empty request error when id param is missing", async () => {
      const requestWithoutId: HttpRequest = {};

      const result = await sut.handle(requestWithoutId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.findById).not.toHaveBeenCalled();
    });

    it("should return empty request error when params is null", async () => {
      const requestWithNullParams: HttpRequest = {
        params: null as any,
      };

      const result = await sut.handle(requestWithNullParams);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.findById).not.toHaveBeenCalled();
    });

    it("should return empty request error when id is empty string", async () => {
      const requestWithEmptyId: HttpRequest = {
        params: { id: "" },
      };

      const result = await sut.handle(requestWithEmptyId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.findById).not.toHaveBeenCalled();
    });

    it("should log error when id param is missing", async () => {
      const requestWithoutId: HttpRequest = {};

      await sut.handle(requestWithoutId);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Campo obrigatório não fornecido: id",
      );
    });

    it("should handle service errors and return appropriate response", async () => {
      const serviceError = new EntityNotFoundError("User");
      mockedService.findById.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.findById).toHaveBeenCalledWith("user-123");
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new EntityNotFoundError("User");
      mockedService.findById.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao listar usuário",
        {
          error: serviceError,
          requestData: { id: "user-123" },
        },
      );
    });

    it("should handle unknown errors and return server error", async () => {
      const unknownError = new Error("Database connection failed");
      mockedService.findById.mockRejectedValueOnce(unknownError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedService.findById).toHaveBeenCalledWith("user-123");
    });

    it("should handle different id formats correctly", async () => {
      const uuidRequest: HttpRequest = {
        params: { id: "550e8400-e29b-41d4-a716-446655440000" },
      };

      mockedService.findById.mockResolvedValueOnce(mockUser);

      const result = await sut.handle(uuidRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: mockUser },
      });
      expect(mockedService.findById).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440000",
      );
    });

    it("should handle concurrent requests with different ids independently", async () => {
      const request1: HttpRequest = { params: { id: "user-1" } };
      const request2: HttpRequest = { params: { id: "user-2" } };
      const user1: UserOutputDTO = {
        ...mockUser,
        id: "user-1",
      };
      const user2: UserOutputDTO = {
        ...mockUser,
        id: "user-2",
      };

      mockedService.findById
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2);

      const [result1, result2] = await Promise.all([
        sut.handle(request1),
        sut.handle(request2),
      ]);

      expect(result1).toEqual({
        statusCode: 200,
        body: { data: user1 },
      });
      expect(result2).toEqual({
        statusCode: 200,
        body: { data: user2 },
      });
      expect(mockedService.findById).toHaveBeenCalledTimes(2);
      expect(mockedService.findById).toHaveBeenNthCalledWith(1, "user-1");
      expect(mockedService.findById).toHaveBeenNthCalledWith(2, "user-2");
    });

    it("should preserve user data structure integrity", async () => {
      mockedService.findById.mockResolvedValueOnce(mockUser);

      const result = await sut.handle(validRequest);

      expect(result.body).toEqual({ data: mockUser });
      const userData = result.body?.data as UserOutputDTO;
      expect(userData).toHaveProperty("id");
      expect(userData).toHaveProperty("role");
      expect(userData).toHaveProperty("military");
      expect(userData.military).toHaveProperty("id");
      expect(userData.military).toHaveProperty("militaryRank");
      expect(userData.military).toHaveProperty("rg");
      expect(userData.military).toHaveProperty("name");
    });

    it("should not modify the original request params", async () => {
      const originalParams = { id: "user-123" };
      const request: HttpRequest = {
        params: { ...originalParams },
      };

      mockedService.findById.mockResolvedValueOnce(mockUser);

      await sut.handle(request);

      expect(request.params).toEqual(originalParams);
    });

    it("should handle special characters in id correctly", async () => {
      const specialIdRequest: HttpRequest = {
        params: { id: "user-123-àáâã" },
      };

      mockedService.findById.mockResolvedValueOnce(mockUser);

      const result = await sut.handle(specialIdRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: mockUser },
      });
      expect(mockedService.findById).toHaveBeenCalledWith("user-123-àáâã");
    });

    it("should handle different user roles correctly", async () => {
      const adminUser: UserOutputDTO = {
        ...mockUser,
        role: UserRole.ADMIN,
      };
      const chefeUser: UserOutputDTO = {
        ...mockUser,
        role: UserRole.CHEFE,
        id: "user-456",
      };
      const bombeiroUser: UserOutputDTO = {
        ...mockUser,
        role: UserRole.BOMBEIRO,
        id: "user-789",
      };

      mockedService.findById.mockResolvedValueOnce(adminUser);
      mockedService.findById.mockResolvedValueOnce(chefeUser);
      mockedService.findById.mockResolvedValueOnce(bombeiroUser);

      const adminResult = await sut.handle({ params: { id: "admin-123" } });
      const chefeResult = await sut.handle({ params: { id: "chefe-456" } });
      const bombeiroResult = await sut.handle({
        params: { id: "bombeiro-789" },
      });

      expect(adminResult.body).toEqual({ data: adminUser });
      expect(chefeResult.body).toEqual({ data: chefeUser });
      expect(bombeiroResult.body).toEqual({ data: bombeiroUser });
    });

    it("should handle user with complete military information", async () => {
      const userWithCompleteInfo: UserOutputDTO = {
        id: "user-complete",
        role: UserRole.CHEFE,
        military: {
          id: "military-complete",
          militaryRank: {
            id: "rank-complete",
            abbreviation: "TEN",
            order: 8,
          },
          rg: 98765432,
          name: "Maria dos Santos Silva",
        },
      };

      mockedService.findById.mockResolvedValueOnce(userWithCompleteInfo);

      const result = await sut.handle({
        params: { id: "user-complete" },
      });

      expect(result).toEqual({
        statusCode: 200,
        body: { data: userWithCompleteInfo },
      });
      const userData = result.body?.data as UserOutputDTO;
      expect(userData.military.name).toBe("Maria dos Santos Silva");
      expect(userData.military.militaryRank.abbreviation).toBe("TEN");
    });

    it("should handle numeric string ids correctly", async () => {
      const numericIdRequest: HttpRequest = {
        params: { id: "12345" },
      };

      mockedService.findById.mockResolvedValueOnce(mockUser);

      const result = await sut.handle(numericIdRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: mockUser },
      });
      expect(mockedService.findById).toHaveBeenCalledWith("12345");
    });

    it("should return consistent response format for null results", async () => {
      mockedService.findById.mockResolvedValueOnce(null);

      const result = await sut.handle(validRequest);

      expect(result).toHaveProperty("statusCode", 200);
      expect(result).toHaveProperty("body");
      expect(result.body).toHaveProperty("data", null);
      expect(typeof result.body?.data).toBe("object");
    });

    it("should maintain user role enumeration integrity", async () => {
      const userWithRole: UserOutputDTO = {
        ...mockUser,
        role: UserRole.BOMBEIRO,
      };

      mockedService.findById.mockResolvedValueOnce(userWithRole);

      const result = await sut.handle(validRequest);

      const userData = result.body?.data as UserOutputDTO;
      expect(userData.role).toBe("bombeiro");
      expect(Object.values(UserRole)).toContain(userData.role);
    });
  });
});
