import { mockLogger } from "../../../../__mocks__";
import { UnauthorizedError } from "../../../../src/domain/errors";
import { AuthMiddleware } from "../../../../src/presentation/middlewares/auth.middleware";
import {
  HttpRequest,
  HttpResponse,
} from "../../../../src/presentation/protocols";

interface MockTokenValidator {
  validateAccessToken: jest.Mock;
}

interface MockSessionRepository {
  updateLastAccess: jest.Mock;
}

interface AuthenticatedRequest extends HttpRequest {
  user?: {
    userId: string;
    sessionId: string;
    role: string;
    militaryId: string;
  };
  headers?: { [key: string]: string | string[] | undefined };
}

describe("AuthMiddleware", () => {
  let sut: AuthMiddleware;
  let mockTokenValidator: MockTokenValidator;
  let mockSessionRepository: MockSessionRepository;
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();

    mockTokenValidator = {
      validateAccessToken: jest.fn(),
    };

    mockSessionRepository = {
      updateLastAccess: jest.fn(),
    };

    sut = new AuthMiddleware({
      tokenValidator: mockTokenValidator as any,
      sessionRepository: mockSessionRepository as any,
      logger: mockedLogger,
    });
  });

  describe("validateAuth", () => {
    const validRequest: AuthenticatedRequest = {
      headers: {
        authorization: "Bearer valid.jwt.token",
      },
    };

    const mockPayload = {
      userId: "user-123",
      role: "ADMIN",
      militaryId: "military-123",
    };

    const mockSessionId = "session-123";

    it("should validate auth successfully with valid token", async () => {
      mockTokenValidator.validateAccessToken.mockResolvedValueOnce({
        payload: mockPayload,
        sessionId: mockSessionId,
      });

      const result = await sut.validateAuth(validRequest);

      expect(result).toEqual({
        ...validRequest,
        user: {
          userId: mockPayload.userId,
          sessionId: mockSessionId,
          role: mockPayload.role,
          militaryId: mockPayload.militaryId,
        },
      });
      expect(mockTokenValidator.validateAccessToken).toHaveBeenCalledWith(
        "Bearer valid.jwt.token",
      );
      expect(mockTokenValidator.validateAccessToken).toHaveBeenCalledTimes(1);
    });

    it("should log success when validation is successful", async () => {
      mockTokenValidator.validateAccessToken.mockResolvedValueOnce({
        payload: mockPayload,
        sessionId: mockSessionId,
      });

      await sut.validateAuth(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuário validado com sucesso",
        {
          userId: mockPayload.userId,
          role: mockPayload.role,
          sessionId: mockSessionId,
        },
      );
    });

    it("should handle missing authorization header", async () => {
      const requestWithoutAuth: AuthenticatedRequest = {
        headers: {},
      };

      mockTokenValidator.validateAccessToken.mockRejectedValueOnce(
        new UnauthorizedError("Token não fornecido"),
      );

      const result = await sut.validateAuth(requestWithoutAuth);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Token não fornecido" },
      });
      expect(mockTokenValidator.validateAccessToken).toHaveBeenCalledWith(
        undefined,
      );
    });

    it("should handle undefined headers", async () => {
      const requestWithoutHeaders: AuthenticatedRequest = {};

      mockTokenValidator.validateAccessToken.mockRejectedValueOnce(
        new UnauthorizedError("Token não fornecido"),
      );

      const result = await sut.validateAuth(requestWithoutHeaders);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Token não fornecido" },
      });
      expect(mockTokenValidator.validateAccessToken).toHaveBeenCalledWith(
        undefined,
      );
    });

    it("should handle UnauthorizedError from token validation service", async () => {
      const serviceError = new UnauthorizedError("Token inválido");
      mockTokenValidator.validateAccessToken.mockRejectedValueOnce(
        serviceError,
      );

      const result = await sut.validateAuth(validRequest);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: serviceError.message },
      });
      expect(mockTokenValidator.validateAccessToken).toHaveBeenCalledWith(
        "Bearer valid.jwt.token",
      );
    });

    it("should handle generic errors from token validation service", async () => {
      const genericError = new Error("Database connection failed");
      mockTokenValidator.validateAccessToken.mockRejectedValueOnce(
        genericError,
      );

      const result = await sut.validateAuth(validRequest);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Falha na autenticação" },
      });
      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro na validação de autenticação",
        { error: genericError },
      );
    });

    it("should handle different token formats", async () => {
      const tokenFormats = [
        "Bearer valid.jwt.token",
        "bearer another.token",
        "JWT yet.another.token",
        "valid.token.without.prefix",
      ];

      for (const token of tokenFormats) {
        const request: AuthenticatedRequest = {
          headers: {
            authorization: token,
          },
        };

        mockTokenValidator.validateAccessToken.mockResolvedValueOnce({
          payload: mockPayload,
          sessionId: mockSessionId,
        });

        await sut.validateAuth(request);

        expect(mockTokenValidator.validateAccessToken).toHaveBeenCalledWith(
          token,
        );
      }
    });

    it("should handle different user roles", async () => {
      const roles = ["ADMIN", "CHEFE", "ACA", "BOMBEIRO"];

      for (const role of roles) {
        const payload = { ...mockPayload, role };

        mockTokenValidator.validateAccessToken.mockResolvedValueOnce({
          payload,
          sessionId: mockSessionId,
        });

        const result = await sut.validateAuth(validRequest);

        expect((result as AuthenticatedRequest).user?.role).toBe(role);
        expect(mockedLogger.info).toHaveBeenCalledWith(
          "Usuário validado com sucesso",
          {
            userId: payload.userId,
            role: role,
            sessionId: mockSessionId,
          },
        );
      }
    });

    it("should preserve original request data", async () => {
      const requestWithData: AuthenticatedRequest = {
        headers: {
          authorization: "Bearer valid.jwt.token",
          "content-type": "application/json",
        },
        body: { someData: "test" },
        params: { id: "123" },
      };

      mockTokenValidator.validateAccessToken.mockResolvedValueOnce({
        payload: mockPayload,
        sessionId: mockSessionId,
      });

      const result = await sut.validateAuth(requestWithData);

      expect(result).toMatchObject({
        headers: requestWithData.headers,
        body: requestWithData.body,
        params: requestWithData.params,
        user: {
          userId: mockPayload.userId,
          sessionId: mockSessionId,
          role: mockPayload.role,
          militaryId: mockPayload.militaryId,
        },
      });
    });
  });

  describe("updateSessionAccess", () => {
    it("should call session service to update last access", async () => {
      const sessionId = "session-123";
      mockSessionRepository.updateLastAccess.mockResolvedValueOnce(undefined);

      await sut.updateSessionAccess(sessionId);

      expect(mockSessionRepository.updateLastAccess).toHaveBeenCalledWith(
        sessionId,
      );
      expect(mockSessionRepository.updateLastAccess).toHaveBeenCalledTimes(1);
    });

    it("should handle session service errors", async () => {
      const sessionId = "session-123";
      const serviceError = new Error("Session not found");
      mockSessionRepository.updateLastAccess.mockRejectedValueOnce(
        serviceError,
      );

      await expect(sut.updateSessionAccess(sessionId)).rejects.toThrow(
        serviceError,
      );
      expect(mockSessionRepository.updateLastAccess).toHaveBeenCalledWith(
        sessionId,
      );
    });
  });

  describe("authenticate", () => {
    const validRequest: AuthenticatedRequest = {
      headers: {
        authorization: "Bearer valid.jwt.token",
      },
    };

    const mockPayload = {
      userId: "user-123",
      role: "ADMIN",
      militaryId: "military-123",
    };

    const mockSessionId = "session-123";

    it("should authenticate successfully and update session access", async () => {
      mockTokenValidator.validateAccessToken.mockResolvedValueOnce({
        payload: mockPayload,
        sessionId: mockSessionId,
      });
      mockSessionRepository.updateLastAccess.mockResolvedValueOnce(undefined);

      const result = await sut.authenticate(validRequest);

      expect(result).toEqual({
        ...validRequest,
        user: {
          userId: mockPayload.userId,
          sessionId: mockSessionId,
          role: mockPayload.role,
          militaryId: mockPayload.militaryId,
        },
      });
      expect(mockSessionRepository.updateLastAccess).toHaveBeenCalledWith(
        mockSessionId,
      );
    });

    it("should return error response when validation fails", async () => {
      const serviceError = new UnauthorizedError("Token inválido");
      mockTokenValidator.validateAccessToken.mockRejectedValueOnce(
        serviceError,
      );

      const result = await sut.authenticate(validRequest);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: serviceError.message },
      });
      expect(mockSessionRepository.updateLastAccess).not.toHaveBeenCalled();
    });

    it("should not update session access when validation returns error", async () => {
      mockTokenValidator.validateAccessToken.mockRejectedValueOnce(
        new UnauthorizedError("Token expirado"),
      );

      const result = await sut.authenticate(validRequest);

      expect("statusCode" in result).toBe(true);
      expect(mockSessionRepository.updateLastAccess).not.toHaveBeenCalled();
    });

    it("should handle session update errors gracefully", async () => {
      mockTokenValidator.validateAccessToken.mockResolvedValueOnce({
        payload: mockPayload,
        sessionId: mockSessionId,
      });
      mockSessionRepository.updateLastAccess.mockRejectedValueOnce(
        new Error("Session update failed"),
      );

      await expect(sut.authenticate(validRequest)).rejects.toThrow(
        "Session update failed",
      );
      expect(mockSessionRepository.updateLastAccess).toHaveBeenCalledWith(
        mockSessionId,
      );
    });

    it("should not update session when user is not present in validated request", async () => {
      jest.spyOn(sut, "validateAuth").mockResolvedValueOnce({
        headers: validRequest.headers,
      } as AuthenticatedRequest);

      const result = await sut.authenticate(validRequest);

      expect(mockSessionRepository.updateLastAccess).not.toHaveBeenCalled();
      expect(result).toEqual({
        headers: validRequest.headers,
      });
    });

    it("should not update session when sessionId is missing", async () => {
      jest.spyOn(sut, "validateAuth").mockResolvedValueOnce({
        ...validRequest,
        user: {
          userId: mockPayload.userId,
          sessionId: "",
          role: mockPayload.role,
          militaryId: mockPayload.militaryId,
        },
      } as AuthenticatedRequest);

      const result = await sut.authenticate(validRequest);

      expect(mockSessionRepository.updateLastAccess).not.toHaveBeenCalled();
      expect((result as AuthenticatedRequest).user?.sessionId).toBe("");
    });
  });

  describe("authorize", () => {
    const authenticatedRequest: AuthenticatedRequest = {
      user: {
        userId: "user-123",
        sessionId: "session-123",
        role: "ADMIN",
        militaryId: "military-123",
      },
    };

    it("should authorize user with valid role", () => {
      const authorizeFunction = sut.authorize(["ADMIN", "CHEFE"]);

      const result = authorizeFunction(authenticatedRequest);

      expect(result).toEqual(authenticatedRequest);
      expect(mockedLogger.debug).toHaveBeenCalledWith("Usuário autorizado", {
        userId: authenticatedRequest.user?.userId,
        role: authenticatedRequest.user?.role,
        allowedRoles: ["ADMIN", "CHEFE"],
      });
    });

    it("should deny authorization for insufficient role", () => {
      const authorizeFunction = sut.authorize(["SUPER_ADMIN"]);

      const result = authorizeFunction(authenticatedRequest);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Acesso negado" },
      });
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Acesso negado - papel insuficiente",
        {
          userId: authenticatedRequest.user?.userId,
          userRole: authenticatedRequest.user?.role,
          requiredRoles: ["SUPER_ADMIN"],
        },
      );
    });

    it("should deny authorization for unauthenticated user", () => {
      const unauthenticatedRequest: AuthenticatedRequest = {};
      const authorizeFunction = sut.authorize(["ADMIN"]);

      const result = authorizeFunction(unauthenticatedRequest);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Usuário não autenticado" },
      });
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Tentativa de autorização sem usuário autenticado",
      );
    });

    it("should handle multiple allowed roles", () => {
      const roles = ["ADMIN", "CHEFE", "ACA", "BOMBEIRO"];

      for (const userRole of roles) {
        const request: AuthenticatedRequest = {
          user: {
            userId: "user-123",
            sessionId: "session-123",
            role: userRole,
            militaryId: "military-123",
          },
        };

        const authorizeFunction = sut.authorize(roles);
        const result = authorizeFunction(request);

        expect(result).toEqual(request);
        expect(mockedLogger.debug).toHaveBeenCalledWith("Usuário autorizado", {
          userId: request.user?.userId,
          role: userRole,
          allowedRoles: roles,
        });
      }
    });

    it("should handle single allowed role", () => {
      const authorizeFunction = sut.authorize(["ADMIN"]);

      const result = authorizeFunction(authenticatedRequest);

      expect(result).toEqual(authenticatedRequest);
      expect(mockedLogger.debug).toHaveBeenCalledWith("Usuário autorizado", {
        userId: authenticatedRequest.user?.userId,
        role: authenticatedRequest.user?.role,
        allowedRoles: ["ADMIN"],
      });
    });

    it("should handle empty allowed roles array", () => {
      const authorizeFunction = sut.authorize([]);

      const result = authorizeFunction(authenticatedRequest);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Acesso negado" },
      });
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Acesso negado - papel insuficiente",
        {
          userId: authenticatedRequest.user?.userId,
          userRole: authenticatedRequest.user?.role,
          requiredRoles: [],
        },
      );
    });

    it("should handle case-sensitive role comparison", () => {
      const request: AuthenticatedRequest = {
        user: {
          userId: "user-123",
          sessionId: "session-123",
          role: "admin", // lowercase
          militaryId: "military-123",
        },
      };

      const authorizeFunction = sut.authorize(["ADMIN"]); // uppercase
      const result = authorizeFunction(request);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Acesso negado" },
      });
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Acesso negado - papel insuficiente",
        {
          userId: request.user?.userId,
          userRole: "admin",
          requiredRoles: ["ADMIN"],
        },
      );
    });

    it("should preserve request data when authorization succeeds", () => {
      const requestWithData: AuthenticatedRequest = {
        user: {
          userId: "user-123",
          sessionId: "session-123",
          role: "ADMIN",
          militaryId: "military-123",
        },
        headers: {
          "content-type": "application/json",
        },
        body: { someData: "test" },
        params: { id: "123" },
      };

      const authorizeFunction = sut.authorize(["ADMIN"]);
      const result = authorizeFunction(requestWithData);

      expect(result).toEqual(requestWithData);
    });

    it("should handle undefined user object", () => {
      const requestWithUndefinedUser: AuthenticatedRequest = {
        user: undefined,
      };

      const authorizeFunction = sut.authorize(["ADMIN"]);
      const result = authorizeFunction(requestWithUndefinedUser);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Usuário não autenticado" },
      });
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Tentativa de autorização sem usuário autenticado",
      );
    });

    it("should work with authorization chains", () => {
      const adminAuth = sut.authorize(["ADMIN"]);
      const chefeAuth = sut.authorize(["CHEFE"]);

      // Admin should pass admin auth
      expect(adminAuth(authenticatedRequest)).toEqual(authenticatedRequest);

      // Admin should fail chefe auth
      expect(chefeAuth(authenticatedRequest)).toEqual({
        statusCode: 401,
        body: { error: "Acesso negado" },
      });
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete authentication and authorization flow", async () => {
      const request: AuthenticatedRequest = {
        headers: {
          authorization: "Bearer valid.jwt.token",
        },
      };

      const mockPayload = {
        userId: "user-123",
        role: "ADMIN",
        militaryId: "military-123",
      };

      const mockSessionId = "session-123";

      mockTokenValidator.validateAccessToken.mockResolvedValueOnce({
        payload: mockPayload,
        sessionId: mockSessionId,
      });
      mockSessionRepository.updateLastAccess.mockResolvedValueOnce(undefined);

      // Authenticate
      const authenticatedResult = await sut.authenticate(request);

      // Authorize
      const authorizeFunction = sut.authorize(["ADMIN", "CHEFE"]);
      const authorizedResult = authorizeFunction(
        authenticatedResult as AuthenticatedRequest,
      );

      expect(authorizedResult).toEqual({
        ...request,
        user: {
          userId: mockPayload.userId,
          sessionId: mockSessionId,
          role: mockPayload.role,
          militaryId: mockPayload.militaryId,
        },
      });

      expect(mockTokenValidator.validateAccessToken).toHaveBeenCalledWith(
        "Bearer valid.jwt.token",
      );
      expect(mockSessionRepository.updateLastAccess).toHaveBeenCalledWith(
        mockSessionId,
      );
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuário validado com sucesso",
        {
          userId: mockPayload.userId,
          role: mockPayload.role,
          sessionId: mockSessionId,
        },
      );
      expect(mockedLogger.debug).toHaveBeenCalledWith("Usuário autorizado", {
        userId: mockPayload.userId,
        role: mockPayload.role,
        allowedRoles: ["ADMIN", "CHEFE"],
      });
    });

    it("should handle authentication failure followed by authorization attempt", async () => {
      const request: AuthenticatedRequest = {
        headers: {
          authorization: "Bearer invalid.jwt.token",
        },
      };

      mockTokenValidator.validateAccessToken.mockRejectedValueOnce(
        new UnauthorizedError("Token inválido"),
      );

      // Authenticate (should fail)
      const authenticatedResult = await sut.authenticate(request);

      // Should be an error response, not an authenticated request
      expect("statusCode" in authenticatedResult).toBe(true);
      expect((authenticatedResult as HttpResponse).statusCode).toBe(401);

      // Don't attempt authorization on error response
      expect(mockSessionRepository.updateLastAccess).not.toHaveBeenCalled();
    });
  });
});
