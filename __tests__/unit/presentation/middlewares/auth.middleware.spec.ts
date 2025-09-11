import {
  mockJwtService,
  mockLogger,
  mockSessionRepository,
} from "../../../../__mocks__";
import { JWTPayload, UserSession } from "../../../../src/domain/entities";
import { AuthMiddleware } from "../../../../src/presentation/middlewares";
import { HttpRequest } from "../../../../src/presentation/protocols";

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
  let mockedJwtService: any;
  let mockedSessionRepository: any;
  let mockedLogger: any;

  beforeEach(() => {
    mockedJwtService = mockJwtService();

    mockedSessionRepository = mockSessionRepository();

    mockedLogger = mockLogger();

    sut = new AuthMiddleware({
      jwtService: mockedJwtService,
      sessionRepository: mockedSessionRepository,
      logger: mockedLogger,
    });
  });

  describe("authenticate", () => {
    const validToken = "valid.jwt.token";
    const validPayload: JWTPayload = {
      userId: "user-123",
      sessionId: "session-123",
      role: "Admin",
      militaryId: "military-123",
      iat: Date.now(),
      exp: Date.now() + 3600000,
    };

    const validSession: UserSession = {
      id: "session-123",
      userId: "user-123",
      token: validToken,
      refreshToken: "refresh-token",
      deviceInfo: "test-device",
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
      isActive: true,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
      lastAccessAt: new Date(),
    };

    it("should authenticate successfully with valid token and active session", async () => {
      const request: AuthenticatedRequest = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      };

      mockedJwtService.verifyAccessToken.mockReturnValue(validPayload);
      mockedSessionRepository.findByToken.mockResolvedValue(validSession);
      mockedSessionRepository.updateLastAccess.mockResolvedValue(undefined);

      const result = await sut.authenticate(request);

      expect(result).toEqual({
        ...request,
        user: {
          userId: validPayload.userId,
          sessionId: validSession.id,
          role: validPayload.role,
          militaryId: validPayload.militaryId,
        },
      });

      expect(mockedJwtService.verifyAccessToken).toHaveBeenCalledWith(
        validToken,
      );
      expect(mockedSessionRepository.findByToken).toHaveBeenCalledWith(
        validToken,
      );
      expect(mockedSessionRepository.updateLastAccess).toHaveBeenCalledWith(
        validSession.id,
      );
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuário autenticado com sucesso",
        {
          userId: validPayload.userId,
          role: validPayload.role,
          sessionId: validSession.id,
        },
      );
    });

    it("should return unauthorized when no authorization header is provided", async () => {
      const request: AuthenticatedRequest = {
        headers: {},
      };

      const result = await sut.authenticate(request);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Token de autorização necessário" },
      });

      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Token de autorização ausente ou inválido",
      );
    });

    it("should return unauthorized when authorization header doesn't start with Bearer", async () => {
      const request: AuthenticatedRequest = {
        headers: {
          authorization: "Basic token123",
        },
      };

      const result = await sut.authenticate(request);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Token de autorização necessário" },
      });

      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Token de autorização ausente ou inválido",
      );
    });

    it("should return unauthorized when token is empty", async () => {
      const request: AuthenticatedRequest = {
        headers: {
          authorization: "Bearer ",
        },
      };

      const result = await sut.authenticate(request);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Token inválido" },
      });

      expect(mockedLogger.warn).toHaveBeenCalledWith("Token vazio");
    });

    it("should return unauthorized when JWT verification fails", async () => {
      const request: AuthenticatedRequest = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      };

      mockedJwtService.verifyAccessToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = await sut.authenticate(request);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Falha na autenticação" },
      });

      expect(mockedLogger.error).toHaveBeenCalledWith("Erro na autenticação", {
        error: expect.any(Error),
      });
    });

    it("should return unauthorized when session is not found", async () => {
      const request: AuthenticatedRequest = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      };

      mockedJwtService.verifyAccessToken.mockReturnValue(validPayload);
      mockedSessionRepository.findByToken.mockResolvedValue(null);

      const result = await sut.authenticate(request);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Sessão inválida" },
      });

      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Sessão não encontrada ou inativa",
        {
          userId: validPayload.userId,
        },
      );
    });

    it("should return unauthorized when session is inactive", async () => {
      const request: AuthenticatedRequest = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      };

      const inactiveSession = { ...validSession, isActive: false };

      mockedJwtService.verifyAccessToken.mockReturnValue(validPayload);
      mockedSessionRepository.findByToken.mockResolvedValue(inactiveSession);

      const result = await sut.authenticate(request);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Sessão expirada" },
      });

      expect(mockedLogger.warn).toHaveBeenCalledWith("Sessão inativa", {
        sessionId: inactiveSession.id,
        userId: validPayload.userId,
      });
    });

    it("should handle session repository errors", async () => {
      const request: AuthenticatedRequest = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      };

      mockedJwtService.verifyAccessToken.mockReturnValue(validPayload);
      mockedSessionRepository.findByToken.mockRejectedValue(
        new Error("Database error"),
      );

      const result = await sut.authenticate(request);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Falha na autenticação" },
      });

      expect(mockedLogger.error).toHaveBeenCalledWith("Erro na autenticação", {
        error: expect.any(Error),
      });
    });
  });

  describe("authorize", () => {
    const authenticatedRequest: AuthenticatedRequest = {
      user: {
        userId: "user-123",
        sessionId: "session-123",
        role: "Admin",
        militaryId: "military-123",
      },
    };

    it("should authorize user with correct role", () => {
      const allowedRoles = ["Admin", "Chefe"];
      const authorizeFunc = sut.authorize(allowedRoles);

      const result = authorizeFunc(authenticatedRequest);

      expect(result).toEqual(authenticatedRequest);
      expect(mockedLogger.debug).toHaveBeenCalledWith("Usuário autorizado", {
        userId: "user-123",
        role: "Admin",
        allowedRoles,
      });
    });

    it("should deny access when user role is not in allowed roles", () => {
      const allowedRoles = ["Chefe", "ACA"];
      const authorizeFunc = sut.authorize(allowedRoles);

      const result = authorizeFunc(authenticatedRequest);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Acesso negado" },
      });

      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Acesso negado - papel insuficiente",
        {
          userId: "user-123",
          userRole: "Admin",
          requiredRoles: allowedRoles,
        },
      );
    });

    it("should deny access when user is not authenticated", () => {
      const requestWithoutUser: AuthenticatedRequest = {};
      const allowedRoles = ["Admin"];
      const authorizeFunc = sut.authorize(allowedRoles);

      const result = authorizeFunc(requestWithoutUser);

      expect(result).toEqual({
        statusCode: 401,
        body: { error: "Usuário não autenticado" },
      });

      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Tentativa de autorização sem usuário autenticado",
      );
    });

    it("should handle case where logger.debug is undefined", () => {
      const loggerWithoutDebug = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      const middlewareWithoutDebug = new AuthMiddleware({
        jwtService: mockedJwtService,
        sessionRepository: mockedSessionRepository,
        logger: loggerWithoutDebug,
      });

      const allowedRoles = ["Admin"];
      const authorizeFunc = middlewareWithoutDebug.authorize(allowedRoles);

      expect(() => {
        authorizeFunc(authenticatedRequest);
      }).not.toThrow();
    });

    it("should work with different role combinations", () => {
      const testCases = [
        { userRole: "Admin", allowedRoles: ["Admin"], shouldPass: true },
        {
          userRole: "Chefe",
          allowedRoles: ["Admin", "Chefe"],
          shouldPass: true,
        },
        {
          userRole: "ACA",
          allowedRoles: ["ACA", "Bombeiro"],
          shouldPass: true,
        },
        { userRole: "Bombeiro", allowedRoles: ["Bombeiro"], shouldPass: true },
        {
          userRole: "Bombeiro",
          allowedRoles: ["Admin", "Chefe"],
          shouldPass: false,
        },
        { userRole: "ACA", allowedRoles: ["Admin"], shouldPass: false },
      ];

      testCases.forEach(({ userRole, allowedRoles, shouldPass }) => {
        const request = {
          ...authenticatedRequest,
          user: { ...authenticatedRequest.user!, role: userRole },
        };

        const authorizeFunc = sut.authorize(allowedRoles);
        const result = authorizeFunc(request);

        if (shouldPass) {
          expect(result).toEqual(request);
        } else {
          expect(result).toEqual({
            statusCode: 401,
            body: { error: "Acesso negado" },
          });
        }
      });
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete auth flow with multiple role checks", async () => {
      const token = "valid.token";
      const payload: JWTPayload = {
        userId: "user-123",
        sessionId: "session-123",
        role: "Chefe",
        militaryId: "military-123",
        iat: Date.now(),
        exp: Date.now() + 3600000,
      };

      const session: UserSession = {
        id: "session-123",
        userId: "user-123",
        token,
        refreshToken: "refresh-token",
        deviceInfo: "test-device",
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
        isActive: true,
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
        lastAccessAt: new Date(),
      };

      const request: AuthenticatedRequest = {
        headers: { authorization: `Bearer ${token}` },
      };

      mockedJwtService.verifyAccessToken.mockReturnValue(payload);
      mockedSessionRepository.findByToken.mockResolvedValue(session);
      mockedSessionRepository.updateLastAccess.mockResolvedValue(undefined);

      // First authenticate
      const authResult = await sut.authenticate(request);
      expect("user" in authResult).toBe(true);

      // Then authorize for different roles
      const adminAuthorize = sut.authorize(["Admin"]);
      const chefeAuthorize = sut.authorize(["Chefe", "ACA"]);

      const adminResult = adminAuthorize(authResult as any);
      const chefeResult = chefeAuthorize(authResult as any);

      // Should fail for Admin-only
      expect(adminResult).toEqual({
        statusCode: 401,
        body: { error: "Acesso negado" },
      });

      // Should pass for Chefe-allowed
      expect(chefeResult).toEqual(authResult);
    });
  });
});
