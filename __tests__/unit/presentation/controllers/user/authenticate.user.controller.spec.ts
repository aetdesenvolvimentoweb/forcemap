import {
  mockAuthenticateUserService,
  mockLogger,
} from "../../../../../__mocks__";
import { InvalidParamError } from "../../../../../src/application/errors";
import {
  UserAuthenticatedDTO,
  UserCredentialsInputDTO,
} from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";
import { AuthenticateUserController } from "../../../../../src/presentation/controllers";
import { HttpRequest } from "../../../../../src/presentation/protocols";

describe("AuthenticateUserController", () => {
  let sut: AuthenticateUserController;
  let mockedService = mockAuthenticateUserService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new AuthenticateUserController({
      authenticateUserService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validBody: UserCredentialsInputDTO = {
      rg: 12345678,
      password: "validPassword123",
    };

    const validRequest: HttpRequest<UserCredentialsInputDTO> = {
      body: validBody,
    };

    const mockAuthenticatedUser: UserAuthenticatedDTO = {
      id: "user-123",
      role: UserRole.ADMIN,
      military: "João da Silva",
    };

    it("should authenticate user successfully with valid credentials", async () => {
      mockedService.authenticate.mockResolvedValueOnce(mockAuthenticatedUser);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: mockAuthenticatedUser },
      });
      expect(mockedService.authenticate).toHaveBeenCalledWith(validBody);
      expect(mockedService.authenticate).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request with masked password", async () => {
      mockedService.authenticate.mockResolvedValueOnce(mockAuthenticatedUser);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para autenticar usuário",
        {
          rg: validBody.rg,
          password: "senha oculta",
        },
      );
    });

    it("should log info when user is authenticated successfully", async () => {
      mockedService.authenticate.mockResolvedValueOnce(mockAuthenticatedUser);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuário autenticado com sucesso",
        {
          userId: mockAuthenticatedUser.id,
          role: mockAuthenticatedUser.role,
        },
      );
    });

    it("should return null when user is not found", async () => {
      mockedService.authenticate.mockResolvedValueOnce(null);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: null },
      });
      expect(mockedService.authenticate).toHaveBeenCalledWith(validBody);
    });

    it("should log info when user is not authenticated", async () => {
      mockedService.authenticate.mockResolvedValueOnce(null);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuário autenticado com sucesso",
        {
          userId: undefined,
          role: undefined,
        },
      );
    });

    it("should return empty request error when body is missing", async () => {
      const requestWithoutBody: HttpRequest<UserCredentialsInputDTO> = {};

      const result = await sut.handle(requestWithoutBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.authenticate).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is null", async () => {
      const requestWithNullBody: HttpRequest<UserCredentialsInputDTO> = {
        body: null as any,
      };

      const result = await sut.handle(requestWithNullBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.authenticate).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is undefined", async () => {
      const requestWithUndefinedBody: HttpRequest<UserCredentialsInputDTO> = {
        body: undefined,
      };

      const result = await sut.handle(requestWithUndefinedBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.authenticate).not.toHaveBeenCalled();
    });

    it("should log error when body is missing", async () => {
      const requestWithoutBody: HttpRequest<UserCredentialsInputDTO> = {};

      await sut.handle(requestWithoutBody);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Body da requisição vazio ou inválido",
      );
    });

    it("should handle invalid credentials error and return appropriate response", async () => {
      const serviceError = new InvalidParamError(
        "credentials",
        "credenciais inválidas",
      );
      mockedService.authenticate.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.authenticate).toHaveBeenCalledWith(validBody);
    });

    it("should handle wrong password error and return appropriate response", async () => {
      const serviceError = new InvalidParamError("password", "senha incorreta");
      mockedService.authenticate.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.authenticate).toHaveBeenCalledWith(validBody);
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new InvalidParamError("rg", "RG não encontrado");
      mockedService.authenticate.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao autenticar usuário",
        {
          error: serviceError,
          requestData: { rg: validBody.rg },
        },
      );
    });

    it("should handle unknown errors and return server error", async () => {
      const unknownError = new Error("Database connection failed");
      mockedService.authenticate.mockRejectedValueOnce(unknownError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedService.authenticate).toHaveBeenCalledWith(validBody);
    });

    it("should handle authentication with ADMIN role", async () => {
      const adminUser: UserAuthenticatedDTO = {
        id: "admin-123",
        role: UserRole.ADMIN,
        military: "Admin Silva",
      };

      mockedService.authenticate.mockResolvedValueOnce(adminUser);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: adminUser },
      });
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuário autenticado com sucesso",
        {
          userId: adminUser.id,
          role: UserRole.ADMIN,
        },
      );
    });

    it("should handle authentication with CHEFE role", async () => {
      const chefeUser: UserAuthenticatedDTO = {
        id: "chefe-456",
        role: UserRole.CHEFE,
        military: "Chefe Santos",
      };

      mockedService.authenticate.mockResolvedValueOnce(chefeUser);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: chefeUser },
      });
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuário autenticado com sucesso",
        {
          userId: chefeUser.id,
          role: UserRole.CHEFE,
        },
      );
    });

    it("should handle authentication with BOMBEIRO role", async () => {
      const bombeiroUser: UserAuthenticatedDTO = {
        id: "bombeiro-789",
        role: UserRole.BOMBEIRO,
        military: "Bombeiro Silva",
      };

      mockedService.authenticate.mockResolvedValueOnce(bombeiroUser);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: bombeiroUser },
      });
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuário autenticado com sucesso",
        {
          userId: bombeiroUser.id,
          role: UserRole.BOMBEIRO,
        },
      );
    });

    it("should handle concurrent authentication requests independently", async () => {
      const body1: UserCredentialsInputDTO = {
        rg: 11111111,
        password: "password1",
      };
      const body2: UserCredentialsInputDTO = {
        rg: 22222222,
        password: "password2",
      };

      const user1: UserAuthenticatedDTO = {
        id: "user-1",
        role: UserRole.ADMIN,
        military: "User One",
      };
      const user2: UserAuthenticatedDTO = {
        id: "user-2",
        role: UserRole.CHEFE,
        military: "User Two",
      };

      const request1: HttpRequest<UserCredentialsInputDTO> = { body: body1 };
      const request2: HttpRequest<UserCredentialsInputDTO> = { body: body2 };

      mockedService.authenticate
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
      expect(mockedService.authenticate).toHaveBeenCalledTimes(2);
      expect(mockedService.authenticate).toHaveBeenNthCalledWith(1, body1);
      expect(mockedService.authenticate).toHaveBeenNthCalledWith(2, body2);
    });

    it("should preserve request data structure integrity", async () => {
      const complexBody: UserCredentialsInputDTO = {
        rg: 99999999,
        password: "complexPassword123!@#",
      };

      const request: HttpRequest<UserCredentialsInputDTO> = {
        body: complexBody,
      };

      mockedService.authenticate.mockResolvedValueOnce(mockAuthenticatedUser);

      await sut.handle(request);

      expect(mockedService.authenticate).toHaveBeenCalledWith(complexBody);

      const calledWith = mockedService.authenticate.mock.calls[0][0];
      expect(calledWith).toHaveProperty("rg");
      expect(calledWith).toHaveProperty("password");
      expect(typeof calledWith.rg).toBe("number");
      expect(typeof calledWith.password).toBe("string");
    });

    it("should not modify the original request body", async () => {
      const originalBody: UserCredentialsInputDTO = {
        rg: 12345678,
        password: "originalPassword",
      };

      const request: HttpRequest<UserCredentialsInputDTO> = {
        body: { ...originalBody },
      };

      mockedService.authenticate.mockResolvedValueOnce(mockAuthenticatedUser);

      await sut.handle(request);

      expect(request.body).toEqual(originalBody);
    });

    it("should handle different RG formats correctly", async () => {
      const differentRgBodies = [
        { rg: 12345678, password: "pass123" },
        { rg: 87654321, password: "pass456" },
        { rg: 11111111, password: "pass789" },
      ];

      for (const body of differentRgBodies) {
        mockedService.authenticate.mockResolvedValueOnce(mockAuthenticatedUser);

        const result = await sut.handle({ body });

        expect(result.statusCode).toBe(200);
        expect(mockedService.authenticate).toHaveBeenCalledWith(body);
      }
    });

    it("should handle password with special characters", async () => {
      const specialPasswordBody: UserCredentialsInputDTO = {
        rg: 12345678,
        password: "SpecialPass!@#$%^&*()",
      };

      mockedService.authenticate.mockResolvedValueOnce(mockAuthenticatedUser);

      const result = await sut.handle({ body: specialPasswordBody });

      expect(result).toEqual({
        statusCode: 200,
        body: { data: mockAuthenticatedUser },
      });
      expect(mockedService.authenticate).toHaveBeenCalledWith(
        specialPasswordBody,
      );
    });

    it("should maintain password security in logs", async () => {
      const sensitiveBody: UserCredentialsInputDTO = {
        rg: 12345678,
        password: "verySensitivePassword123!",
      };

      mockedService.authenticate.mockResolvedValueOnce(mockAuthenticatedUser);

      await sut.handle({ body: sensitiveBody });

      // Verify password is masked in logs
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para autenticar usuário",
        {
          rg: sensitiveBody.rg,
          password: "senha oculta",
        },
      );

      // Verify no password information is logged on success
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuário autenticado com sucesso",
        {
          userId: mockAuthenticatedUser.id,
          role: mockAuthenticatedUser.role,
        },
      );
    });

    it("should handle user account locked scenarios", async () => {
      const serviceError = new InvalidParamError("account", "conta bloqueada");
      mockedService.authenticate.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
    });

    it("should handle expired password scenarios", async () => {
      const serviceError = new InvalidParamError("password", "senha expirada");
      mockedService.authenticate.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
    });

    it("should handle malformed RG validation", async () => {
      const serviceError = new InvalidParamError(
        "rg",
        "formato de RG inválido",
      );
      mockedService.authenticate.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
    });

    it("should maintain consistent response structure", async () => {
      mockedService.authenticate.mockResolvedValueOnce(mockAuthenticatedUser);

      const result = await sut.handle(validRequest);

      expect(result).toHaveProperty("statusCode", 200);
      expect(result).toHaveProperty("body");
      expect(result.body).toHaveProperty("data");

      const userData = result.body?.data as UserAuthenticatedDTO;
      expect(userData).toHaveProperty("id");
      expect(userData).toHaveProperty("role");
      expect(userData).toHaveProperty("military");
    });

    it("should validate role enumeration consistency", async () => {
      const usersWithAllRoles = [
        { ...mockAuthenticatedUser, role: UserRole.ADMIN },
        { ...mockAuthenticatedUser, role: UserRole.CHEFE },
        { ...mockAuthenticatedUser, role: UserRole.BOMBEIRO },
      ];

      for (const user of usersWithAllRoles) {
        mockedService.authenticate.mockResolvedValueOnce(user);

        const result = await sut.handle(validRequest);

        const userData = result.body?.data as UserAuthenticatedDTO;
        expect(Object.values(UserRole)).toContain(userData.role);
      }
    });
  });
});
