import { UnauthorizedError } from "../../../../../src/application/errors";
import {
  LoggerProtocol,
  TokenHandlerProtocol,
} from "../../../../../src/application/protocols";
import {
  TokenValidator,
  ValidatedTokenResult,
} from "../../../../../src/application/validators/auth/token.validator";
import {
  Payload,
  RefreshTokenPayload,
  UserSession,
} from "../../../../../src/domain/entities";
import { SessionRepository } from "../../../../../src/domain/repositories";

describe("TokenValidator", () => {
  let sut: TokenValidator;
  let mockTokenHandler: jest.Mocked<TokenHandlerProtocol>;
  let mockSessionRepository: jest.Mocked<SessionRepository>;
  let mockLogger: jest.Mocked<LoggerProtocol>;

  const mockPayload: Payload = {
    userId: "user-123",
    sessionId: "session-123",
    role: "admin",
    militaryId: "mil-123",
    iat: 1234567890,
    exp: 1234567890 + 3600,
  };

  const mockRefreshTokenPayload: RefreshTokenPayload = {
    userId: "user-123",
    sessionId: "session-123",
    iat: 1234567890,
    exp: 1234567890 + 86400,
  };

  const mockActiveSession: UserSession = {
    id: "session-123",
    userId: "user-123",
    token: "valid-access-token",
    refreshToken: "valid-refresh-token",
    deviceInfo: "Test Device",
    ipAddress: "192.168.1.1",
    userAgent: "Test Agent",
    isActive: true,
    expiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date(),
    lastAccessAt: new Date(),
  };

  const mockInactiveSession: UserSession = {
    ...mockActiveSession,
    isActive: false,
  };

  beforeEach(() => {
    mockTokenHandler = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      extractTokenFromHeader: jest.fn(),
    };

    mockSessionRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      findByRefreshToken: jest.fn(),
      findBySessionId: jest.fn(),
      findActiveByUserId: jest.fn(),
      updateLastAccess: jest.fn(),
      updateToken: jest.fn(),
      updateRefreshToken: jest.fn(),
      deactivateSession: jest.fn(),
      deactivateAllUserSessions: jest.fn(),
      deleteExpiredSessions: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    sut = new TokenValidator({
      tokenHandler: mockTokenHandler,
      sessionRepository: mockSessionRepository,
      logger: mockLogger,
    });
  });

  describe("constructor", () => {
    it("should create instance successfully", () => {
      expect(sut).toBeInstanceOf(TokenValidator);
      expect(sut.validateAccessToken).toBeDefined();
      expect(sut.validateRefreshToken).toBeDefined();
    });
  });

  describe("validateAccessToken", () => {
    const validAuthHeader = "Bearer valid-access-token";

    it("should validate access token successfully", async () => {
      mockTokenHandler.verifyAccessToken.mockReturnValue(mockPayload);
      mockSessionRepository.findByToken.mockResolvedValue(mockActiveSession);

      const result: ValidatedTokenResult =
        await sut.validateAccessToken(validAuthHeader);

      expect(result).toEqual({
        payload: mockPayload,
        sessionId: mockActiveSession.id,
      });
      expect(mockTokenHandler.verifyAccessToken).toHaveBeenCalledWith(
        "valid-access-token",
      );
      expect(mockSessionRepository.findByToken).toHaveBeenCalledWith(
        "valid-access-token",
      );
    });

    describe("authorization header validation", () => {
      it("should throw UnauthorizedError when authHeader is missing", async () => {
        await expect(sut.validateAccessToken("")).rejects.toThrow(
          new UnauthorizedError("Token de autorização necessário"),
        );

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "Token de autorização ausente ou inválido",
        );
      });

      it("should throw UnauthorizedError when authHeader is null", async () => {
        await expect(sut.validateAccessToken(null as any)).rejects.toThrow(
          new UnauthorizedError("Token de autorização necessário"),
        );

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "Token de autorização ausente ou inválido",
        );
      });

      it("should throw UnauthorizedError when authHeader is undefined", async () => {
        await expect(sut.validateAccessToken(undefined as any)).rejects.toThrow(
          new UnauthorizedError("Token de autorização necessário"),
        );

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "Token de autorização ausente ou inválido",
        );
      });

      it("should throw UnauthorizedError when authHeader does not start with Bearer", async () => {
        await expect(
          sut.validateAccessToken("Basic invalid-token"),
        ).rejects.toThrow(
          new UnauthorizedError("Token de autorização necessário"),
        );

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "Token de autorização ausente ou inválido",
        );
      });

      it("should throw UnauthorizedError when token is empty after Bearer prefix", async () => {
        await expect(sut.validateAccessToken("Bearer ")).rejects.toThrow(
          new UnauthorizedError("Token inválido"),
        );

        expect(mockLogger.warn).toHaveBeenCalledWith("Token vazio");
      });

      it("should throw UnauthorizedError when only Bearer is provided", async () => {
        await expect(sut.validateAccessToken("Bearer")).rejects.toThrow(
          new UnauthorizedError("Token de autorização necessário"),
        );

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "Token de autorização ausente ou inválido",
        );
      });
    });

    describe("token verification", () => {
      it("should throw UnauthorizedError when token verification fails", async () => {
        mockTokenHandler.verifyAccessToken.mockImplementation(() => {
          throw new Error("Invalid token signature");
        });

        await expect(sut.validateAccessToken(validAuthHeader)).rejects.toThrow(
          new UnauthorizedError("Token inválido"),
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Erro na validação do token",
          {
            error: expect.any(Error),
          },
        );
      });

      it("should re-throw UnauthorizedError from token verification", async () => {
        const unauthorizedError = new UnauthorizedError("Token expired");
        mockTokenHandler.verifyAccessToken.mockImplementation(() => {
          throw unauthorizedError;
        });

        await expect(sut.validateAccessToken(validAuthHeader)).rejects.toThrow(
          unauthorizedError,
        );

        expect(mockLogger.error).not.toHaveBeenCalled();
      });
    });

    describe("session validation", () => {
      beforeEach(() => {
        mockTokenHandler.verifyAccessToken.mockReturnValue(mockPayload);
      });

      it("should throw UnauthorizedError when session is not found", async () => {
        mockSessionRepository.findByToken.mockResolvedValue(null);

        await expect(sut.validateAccessToken(validAuthHeader)).rejects.toThrow(
          new UnauthorizedError("Sessão não encontrada"),
        );

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "Sessão não encontrada para o token",
          {
            token: "valid-acce...",
          },
        );
      });

      it("should throw UnauthorizedError when session is inactive", async () => {
        mockSessionRepository.findByToken.mockResolvedValue(
          mockInactiveSession,
        );

        await expect(sut.validateAccessToken(validAuthHeader)).rejects.toThrow(
          new UnauthorizedError("Sessão expirada"),
        );

        expect(mockLogger.warn).toHaveBeenCalledWith("Sessão inativa", {
          sessionId: mockInactiveSession.id,
          userId: mockPayload.userId,
        });
      });
    });

    describe("edge cases", () => {
      it("should handle very long tokens by truncating in logs", async () => {
        const longToken = "a".repeat(100);
        const longAuthHeader = `Bearer ${longToken}`;

        mockTokenHandler.verifyAccessToken.mockReturnValue(mockPayload);
        mockSessionRepository.findByToken.mockResolvedValue(null);

        await expect(sut.validateAccessToken(longAuthHeader)).rejects.toThrow(
          new UnauthorizedError("Sessão não encontrada"),
        );

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "Sessão não encontrada para o token",
          {
            token: "aaaaaaaaaa...",
          },
        );
      });

      it("should handle repository errors", async () => {
        mockTokenHandler.verifyAccessToken.mockReturnValue(mockPayload);
        mockSessionRepository.findByToken.mockRejectedValue(
          new Error("Database error"),
        );

        await expect(sut.validateAccessToken(validAuthHeader)).rejects.toThrow(
          new UnauthorizedError("Token inválido"),
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Erro na validação do token",
          {
            error: expect.any(Error),
          },
        );
      });
    });
  });

  describe("validateRefreshToken", () => {
    const validRefreshToken = "valid-refresh-token";

    it("should validate refresh token successfully", async () => {
      mockTokenHandler.verifyRefreshToken.mockReturnValue(
        mockRefreshTokenPayload,
      );
      mockSessionRepository.findByRefreshToken.mockResolvedValue(
        mockActiveSession,
      );

      const result = await sut.validateRefreshToken(validRefreshToken);

      expect(result).toEqual({
        payload: mockRefreshTokenPayload,
        session: mockActiveSession,
      });
      expect(mockTokenHandler.verifyRefreshToken).toHaveBeenCalledWith(
        validRefreshToken,
      );
      expect(mockSessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        validRefreshToken,
      );
    });

    describe("token verification", () => {
      it("should throw UnauthorizedError when refresh token verification fails", async () => {
        mockTokenHandler.verifyRefreshToken.mockImplementation(() => {
          throw new Error("Invalid refresh token");
        });

        await expect(
          sut.validateRefreshToken(validRefreshToken),
        ).rejects.toThrow(new UnauthorizedError("Refresh token inválido"));

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Erro na validação do refresh token",
          {
            error: expect.any(Error),
          },
        );
      });

      it("should re-throw UnauthorizedError from refresh token verification", async () => {
        const unauthorizedError = new UnauthorizedError(
          "Refresh token expired",
        );
        mockTokenHandler.verifyRefreshToken.mockImplementation(() => {
          throw unauthorizedError;
        });

        await expect(
          sut.validateRefreshToken(validRefreshToken),
        ).rejects.toThrow(unauthorizedError);

        expect(mockLogger.error).not.toHaveBeenCalled();
      });
    });

    describe("session validation", () => {
      beforeEach(() => {
        mockTokenHandler.verifyRefreshToken.mockReturnValue(
          mockRefreshTokenPayload,
        );
      });

      it("should throw UnauthorizedError when session is not found", async () => {
        mockSessionRepository.findByRefreshToken.mockResolvedValue(null);

        await expect(
          sut.validateRefreshToken(validRefreshToken),
        ).rejects.toThrow(new UnauthorizedError("Sessão inválida ou expirada"));

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "Sessão inválida para refresh token",
        );
      });

      it("should throw UnauthorizedError when session is inactive", async () => {
        mockSessionRepository.findByRefreshToken.mockResolvedValue(
          mockInactiveSession,
        );

        await expect(
          sut.validateRefreshToken(validRefreshToken),
        ).rejects.toThrow(new UnauthorizedError("Sessão inválida ou expirada"));

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "Sessão inválida para refresh token",
        );
      });
    });

    describe("edge cases", () => {
      it("should handle repository errors during refresh token validation", async () => {
        mockTokenHandler.verifyRefreshToken.mockReturnValue(
          mockRefreshTokenPayload,
        );
        mockSessionRepository.findByRefreshToken.mockRejectedValue(
          new Error("Database connection failed"),
        );

        await expect(
          sut.validateRefreshToken(validRefreshToken),
        ).rejects.toThrow(new UnauthorizedError("Refresh token inválido"));

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Erro na validação do refresh token",
          {
            error: expect.any(Error),
          },
        );
      });

      it("should handle empty refresh token", async () => {
        mockTokenHandler.verifyRefreshToken.mockImplementation(() => {
          throw new Error("Empty token");
        });

        await expect(sut.validateRefreshToken("")).rejects.toThrow(
          new UnauthorizedError("Refresh token inválido"),
        );
      });

      it("should handle null refresh token", async () => {
        mockTokenHandler.verifyRefreshToken.mockImplementation(() => {
          throw new Error("Null token");
        });

        await expect(sut.validateRefreshToken(null as any)).rejects.toThrow(
          new UnauthorizedError("Refresh token inválido"),
        );
      });
    });
  });

  describe("error handling consistency", () => {
    it("should maintain error handling consistency between access and refresh token methods", async () => {
      const testError = new Error("Test error");

      // Test access token error handling
      mockTokenHandler.verifyAccessToken.mockImplementation(() => {
        throw testError;
      });

      await expect(
        sut.validateAccessToken("Bearer test-token"),
      ).rejects.toThrow(new UnauthorizedError("Token inválido"));

      // Test refresh token error handling
      mockTokenHandler.verifyRefreshToken.mockImplementation(() => {
        throw testError;
      });

      await expect(
        sut.validateRefreshToken("test-refresh-token"),
      ).rejects.toThrow(new UnauthorizedError("Refresh token inválido"));
    });

    it("should handle UnauthorizedError consistently in both methods", async () => {
      const unauthorizedError = new UnauthorizedError(
        "Custom unauthorized message",
      );

      // Test access token UnauthorizedError re-throwing
      mockTokenHandler.verifyAccessToken.mockImplementation(() => {
        throw unauthorizedError;
      });

      await expect(
        sut.validateAccessToken("Bearer test-token"),
      ).rejects.toThrow(unauthorizedError);

      // Test refresh token UnauthorizedError re-throwing
      mockTokenHandler.verifyRefreshToken.mockImplementation(() => {
        throw unauthorizedError;
      });

      await expect(
        sut.validateRefreshToken("test-refresh-token"),
      ).rejects.toThrow(unauthorizedError);
    });
  });

  describe("logging behavior", () => {
    it("should log appropriate warnings for access token validation", async () => {
      // Test missing header logging
      await expect(sut.validateAccessToken("")).rejects.toThrow();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Token de autorização ausente ou inválido",
      );

      // Test empty token logging
      await expect(sut.validateAccessToken("Bearer ")).rejects.toThrow();
      expect(mockLogger.warn).toHaveBeenCalledWith("Token vazio");
    });

    it("should log appropriate warnings for session validation", async () => {
      mockTokenHandler.verifyAccessToken.mockReturnValue(mockPayload);

      // Test session not found logging
      mockSessionRepository.findByToken.mockResolvedValue(null);
      await expect(
        sut.validateAccessToken("Bearer test-token"),
      ).rejects.toThrow();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Sessão não encontrada para o token",
        {
          token: "test-token...",
        },
      );

      // Test inactive session logging
      mockSessionRepository.findByToken.mockResolvedValue(mockInactiveSession);
      await expect(
        sut.validateAccessToken("Bearer test-token"),
      ).rejects.toThrow();
      expect(mockLogger.warn).toHaveBeenCalledWith("Sessão inativa", {
        sessionId: mockInactiveSession.id,
        userId: mockPayload.userId,
      });
    });

    it("should log errors for unexpected exceptions", async () => {
      const testError = new Error("Unexpected error");
      mockTokenHandler.verifyAccessToken.mockImplementation(() => {
        throw testError;
      });

      await expect(
        sut.validateAccessToken("Bearer test-token"),
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Erro na validação do token",
        {
          error: testError,
        },
      );
    });
  });
});
