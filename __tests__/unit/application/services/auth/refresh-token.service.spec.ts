import {
  EntityNotFoundError,
  UnauthorizedError,
} from "../../../../../src/application/errors";
import { TokenHandlerProtocol } from "../../../../../src/application/protocols";
import { RefreshTokenService } from "../../../../../src/application/services/auth/refresh-token.service";
import {
  LoginOutputDTO,
  RefreshTokenInputDTO,
} from "../../../../../src/domain/dtos/auth";
import { UserOutputDTO } from "../../../../../src/domain/dtos/user";
import { UserRole, UserSession } from "../../../../../src/domain/entities";
import {
  SessionRepository,
  UserRepository,
} from "../../../../../src/domain/repositories";

// Mock authSecurityLogger module
jest.mock("../../../../../src/infra/adapters/middlewares", () => ({
  authSecurityLogger: {
    logLogin: jest.fn(),
    logLoginBlocked: jest.fn(),
    logLogout: jest.fn(),
    logTokenRefresh: jest.fn(),
  },
}));

describe("RefreshTokenService", () => {
  let sut: RefreshTokenService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockSessionRepository: jest.Mocked<SessionRepository>;
  let mockTokenHandler: jest.Mocked<TokenHandlerProtocol>;

  const mockUser: UserOutputDTO = {
    id: "user-123",
    role: UserRole.ADMIN,
    military: {
      id: "mil-123",
      militaryRank: {
        id: "rank-123",
        abbreviation: "Cap",
        order: 5,
      },
      rg: 123456789,
      name: "João Silva",
    },
  };

  const mockActiveSession: UserSession = {
    id: "session-123",
    userId: "user-123",
    token: "current-access-token",
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

  const mockRefreshTokenInput: RefreshTokenInputDTO = {
    refreshToken: "valid-refresh-token",
  };

  const mockIpAddress = "192.168.1.1";
  const mockNewAccessToken = "new-access-token";

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByIdWithPassword: jest.fn(),
      findByMilitaryId: jest.fn(),
      findByMilitaryIdWithPassword: jest.fn(),
      listAll: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      updateUserRole: jest.fn(),
      updateUserPassword: jest.fn(),
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

    mockTokenHandler = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      extractTokenFromHeader: jest.fn(),
    };

    const mockSecurityLogger = {
      logLogin: jest.fn(),
      logLoginBlocked: jest.fn(),
      logLogout: jest.fn(),
      logTokenRefresh: jest.fn(),
      logAccessDenied: jest.fn(),
      logSuspiciousActivity: jest.fn(),
    };

    sut = new RefreshTokenService({
      userRepository: mockUserRepository,
      sessionRepository: mockSessionRepository,
      tokenHandler: mockTokenHandler,
      securityLogger: mockSecurityLogger,
    });
  });

  describe("constructor", () => {
    it("should create instance successfully", () => {
      expect(sut).toBeInstanceOf(RefreshTokenService);
      expect(sut.refreshToken).toBeDefined();
    });
  });

  describe("refreshToken", () => {
    const setupSuccessfulMocks = () => {
      mockTokenHandler.verifyRefreshToken.mockReturnValue({
        userId: "user-123",
        sessionId: "session-123",
        iat: 1234567890,
        exp: 1234567890 + 86400,
      });
      mockSessionRepository.findByRefreshToken.mockResolvedValue(
        mockActiveSession,
      );
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockTokenHandler.generateAccessToken.mockReturnValue(mockNewAccessToken);
      mockSessionRepository.updateToken.mockResolvedValue();
    };

    it("should refresh token successfully", async () => {
      setupSuccessfulMocks();

      const result: LoginOutputDTO = await sut.refreshToken(
        mockRefreshTokenInput,
        mockIpAddress,
      );

      expect(result).toEqual({
        accessToken: mockNewAccessToken,
        refreshToken: mockRefreshTokenInput.refreshToken,
        user: {
          id: mockUser.id,
          militaryId: mockUser.military.id,
          role: mockUser.role,
        },
        expiresIn: 15 * 60, // 15 minutes in seconds
      });

      expect(mockTokenHandler.verifyRefreshToken).toHaveBeenCalledWith(
        mockRefreshTokenInput.refreshToken,
      );
      expect(mockSessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        mockRefreshTokenInput.refreshToken,
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        mockActiveSession.userId,
      );
      expect(mockTokenHandler.generateAccessToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        sessionId: mockActiveSession.id,
        role: mockUser.role,
        militaryId: mockUser.military.id,
      });
      expect(mockSessionRepository.updateToken).toHaveBeenCalledWith(
        mockActiveSession.id,
        mockNewAccessToken,
      );
    });

    describe("refresh token verification", () => {
      it("should throw UnauthorizedError when refresh token is invalid", async () => {
        mockTokenHandler.verifyRefreshToken.mockImplementation(() => {
          throw new Error("Invalid token");
        });

        await expect(
          sut.refreshToken(mockRefreshTokenInput, mockIpAddress),
        ).rejects.toThrow(new UnauthorizedError("Erro ao renovar token"));

        expect(mockTokenHandler.verifyRefreshToken).toHaveBeenCalledWith(
          mockRefreshTokenInput.refreshToken,
        );
      });

      it("should re-throw UnauthorizedError from token verification", async () => {
        const unauthorizedError = new UnauthorizedError("Token expired");
        mockTokenHandler.verifyRefreshToken.mockImplementation(() => {
          throw unauthorizedError;
        });

        await expect(
          sut.refreshToken(mockRefreshTokenInput, mockIpAddress),
        ).rejects.toThrow(unauthorizedError);
      });
    });

    describe("session validation", () => {
      beforeEach(() => {
        mockTokenHandler.verifyRefreshToken.mockReturnValue({
          userId: "user-123",
          sessionId: "session-123",
          iat: 1234567890,
          exp: 1234567890 + 86400,
        });
      });

      it("should throw UnauthorizedError when session is not found", async () => {
        mockSessionRepository.findByRefreshToken.mockResolvedValue(null);

        await expect(
          sut.refreshToken(mockRefreshTokenInput, mockIpAddress),
        ).rejects.toThrow(new UnauthorizedError("Sessão inválida ou expirada"));

        expect(mockSessionRepository.findByRefreshToken).toHaveBeenCalledWith(
          mockRefreshTokenInput.refreshToken,
        );
      });

      it("should throw UnauthorizedError when session is inactive", async () => {
        mockSessionRepository.findByRefreshToken.mockResolvedValue(
          mockInactiveSession,
        );

        await expect(
          sut.refreshToken(mockRefreshTokenInput, mockIpAddress),
        ).rejects.toThrow(new UnauthorizedError("Sessão inválida ou expirada"));
      });
    });

    describe("security validation", () => {
      beforeEach(() => {
        mockTokenHandler.verifyRefreshToken.mockReturnValue({
          userId: "user-123",
          sessionId: "session-123",
          iat: 1234567890,
          exp: 1234567890 + 86400,
        });
        mockSessionRepository.findByRefreshToken.mockResolvedValue(
          mockActiveSession,
        );
      });

      it("should throw UnauthorizedError when IP address does not match", async () => {
        const differentIpAddress = "192.168.1.2";

        await expect(
          sut.refreshToken(mockRefreshTokenInput, differentIpAddress),
        ).rejects.toThrow(
          new UnauthorizedError("Sessão comprometida detectada"),
        );

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          mockActiveSession.id,
        );
      });

      it("should deactivate session when IP mismatch is detected", async () => {
        const differentIpAddress = "10.0.0.1";
        mockSessionRepository.deactivateSession.mockResolvedValue();

        await expect(
          sut.refreshToken(mockRefreshTokenInput, differentIpAddress),
        ).rejects.toThrow();

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          mockActiveSession.id,
        );
      });
    });

    describe("user validation", () => {
      beforeEach(() => {
        mockTokenHandler.verifyRefreshToken.mockReturnValue({
          userId: "user-123",
          sessionId: "session-123",
          iat: 1234567890,
          exp: 1234567890 + 86400,
        });
        mockSessionRepository.findByRefreshToken.mockResolvedValue(
          mockActiveSession,
        );
      });

      it("should throw EntityNotFoundError when user is not found", async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        await expect(
          sut.refreshToken(mockRefreshTokenInput, mockIpAddress),
        ).rejects.toThrow(new EntityNotFoundError("Usuário"));

        expect(mockUserRepository.findById).toHaveBeenCalledWith(
          mockActiveSession.userId,
        );
        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          mockActiveSession.id,
        );
      });

      it("should deactivate session when user is not found", async () => {
        mockUserRepository.findById.mockResolvedValue(null);
        mockSessionRepository.deactivateSession.mockResolvedValue();

        await expect(
          sut.refreshToken(mockRefreshTokenInput, mockIpAddress),
        ).rejects.toThrow();

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          mockActiveSession.id,
        );
      });
    });

    describe("token generation and session update", () => {
      beforeEach(() => {
        setupSuccessfulMocks();
      });

      it("should generate new access token with correct payload", async () => {
        await sut.refreshToken(mockRefreshTokenInput, mockIpAddress);

        expect(mockTokenHandler.generateAccessToken).toHaveBeenCalledWith({
          userId: mockUser.id,
          sessionId: mockActiveSession.id,
          role: mockUser.role,
          militaryId: mockUser.military.id,
        });
      });

      it("should update session with new access token", async () => {
        await sut.refreshToken(mockRefreshTokenInput, mockIpAddress);

        expect(mockSessionRepository.updateToken).toHaveBeenCalledWith(
          mockActiveSession.id,
          mockNewAccessToken,
        );
      });

      it("should return same refresh token", async () => {
        const result = await sut.refreshToken(
          mockRefreshTokenInput,
          mockIpAddress,
        );

        expect(result.refreshToken).toBe(mockRefreshTokenInput.refreshToken);
      });

      it("should return correct expiration time", async () => {
        const result = await sut.refreshToken(
          mockRefreshTokenInput,
          mockIpAddress,
        );

        expect(result.expiresIn).toBe(15 * 60); // 15 minutes in seconds
      });
    });

    describe("error handling", () => {
      it("should handle repository errors gracefully", async () => {
        mockTokenHandler.verifyRefreshToken.mockReturnValue({
          userId: "user-123",
          sessionId: "session-123",
          iat: 1234567890,
          exp: 1234567890 + 86400,
        });
        mockSessionRepository.findByRefreshToken.mockRejectedValue(
          new Error("Database error"),
        );

        await expect(
          sut.refreshToken(mockRefreshTokenInput, mockIpAddress),
        ).rejects.toThrow(new UnauthorizedError("Erro ao renovar token"));
      });

      it("should handle token generation errors", async () => {
        mockTokenHandler.verifyRefreshToken.mockReturnValue({
          userId: "user-123",
          sessionId: "session-123",
          iat: 1234567890,
          exp: 1234567890 + 86400,
        });
        mockSessionRepository.findByRefreshToken.mockResolvedValue(
          mockActiveSession,
        );
        mockUserRepository.findById.mockResolvedValue(mockUser);
        mockTokenHandler.generateAccessToken.mockImplementation(() => {
          throw new Error("Token generation failed");
        });

        await expect(
          sut.refreshToken(mockRefreshTokenInput, mockIpAddress),
        ).rejects.toThrow(new UnauthorizedError("Erro ao renovar token"));
      });

      it("should handle session update errors", async () => {
        mockTokenHandler.verifyRefreshToken.mockReturnValue({
          userId: "user-123",
          sessionId: "session-123",
          iat: 1234567890,
          exp: 1234567890 + 86400,
        });
        mockSessionRepository.findByRefreshToken.mockResolvedValue(
          mockActiveSession,
        );
        mockUserRepository.findById.mockResolvedValue(mockUser);
        mockTokenHandler.generateAccessToken.mockReturnValue(
          mockNewAccessToken,
        );
        mockSessionRepository.updateToken.mockRejectedValue(
          new Error("Update failed"),
        );

        await expect(
          sut.refreshToken(mockRefreshTokenInput, mockIpAddress),
        ).rejects.toThrow(new UnauthorizedError("Erro ao renovar token"));
      });

      it("should re-throw EntityNotFoundError without wrapping", async () => {
        const entityError = new EntityNotFoundError("User");
        mockTokenHandler.verifyRefreshToken.mockReturnValue({
          userId: "user-123",
          sessionId: "session-123",
          iat: 1234567890,
          exp: 1234567890 + 86400,
        });
        mockSessionRepository.findByRefreshToken.mockResolvedValue(
          mockActiveSession,
        );
        mockUserRepository.findById.mockImplementation(() => {
          throw entityError;
        });

        await expect(
          sut.refreshToken(mockRefreshTokenInput, mockIpAddress),
        ).rejects.toThrow(entityError);
      });

      it("should re-throw UnauthorizedError without wrapping", async () => {
        const unauthorizedError = new UnauthorizedError("Custom unauthorized");
        mockTokenHandler.verifyRefreshToken.mockImplementation(() => {
          throw unauthorizedError;
        });

        await expect(
          sut.refreshToken(mockRefreshTokenInput, mockIpAddress),
        ).rejects.toThrow(unauthorizedError);
      });
    });

    describe("edge cases", () => {
      it("should handle empty refresh token", async () => {
        const emptyTokenInput: RefreshTokenInputDTO = { refreshToken: "" };
        mockTokenHandler.verifyRefreshToken.mockImplementation(() => {
          throw new Error("Empty token");
        });

        await expect(
          sut.refreshToken(emptyTokenInput, mockIpAddress),
        ).rejects.toThrow(new UnauthorizedError("Erro ao renovar token"));
      });

      it("should handle null IP address", async () => {
        setupSuccessfulMocks();
        const sessionWithNullIp = { ...mockActiveSession, ipAddress: null };
        mockSessionRepository.findByRefreshToken.mockResolvedValue(
          sessionWithNullIp as any,
        );

        await expect(
          sut.refreshToken(mockRefreshTokenInput, mockIpAddress),
        ).rejects.toThrow(
          new UnauthorizedError("Sessão comprometida detectada"),
        );
      });

      it("should handle different IP address formats", async () => {
        setupSuccessfulMocks();
        const ipv6Session = { ...mockActiveSession, ipAddress: "::1" };
        mockSessionRepository.findByRefreshToken.mockResolvedValue(ipv6Session);

        await expect(
          sut.refreshToken(mockRefreshTokenInput, "::1"),
        ).resolves.not.toThrow();
      });

      it("should handle concurrent requests with same session", async () => {
        setupSuccessfulMocks();

        const promise1 = sut.refreshToken(mockRefreshTokenInput, mockIpAddress);
        const promise2 = sut.refreshToken(mockRefreshTokenInput, mockIpAddress);

        const [result1, result2] = await Promise.all([promise1, promise2]);

        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
        expect(mockTokenHandler.generateAccessToken).toHaveBeenCalledTimes(2);
      });
    });

    describe("security scenarios", () => {
      it("should handle session hijacking attempt", async () => {
        mockTokenHandler.verifyRefreshToken.mockReturnValue({
          userId: "user-123",
          sessionId: "session-123",
          iat: 1234567890,
          exp: 1234567890 + 86400,
        });
        mockSessionRepository.findByRefreshToken.mockResolvedValue(
          mockActiveSession,
        );

        const attackerIp = "10.0.0.999";

        await expect(
          sut.refreshToken(mockRefreshTokenInput, attackerIp),
        ).rejects.toThrow(
          new UnauthorizedError("Sessão comprometida detectada"),
        );

        expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
          mockActiveSession.id,
        );
      });

      it("should handle deactivateSession failure gracefully", async () => {
        mockTokenHandler.verifyRefreshToken.mockReturnValue({
          userId: "user-123",
          sessionId: "session-123",
          iat: 1234567890,
          exp: 1234567890 + 86400,
        });
        mockSessionRepository.findByRefreshToken.mockResolvedValue(
          mockActiveSession,
        );
        mockSessionRepository.deactivateSession.mockRejectedValue(
          new Error("Deactivation failed"),
        );

        const differentIp = "192.168.1.2";

        await expect(
          sut.refreshToken(mockRefreshTokenInput, differentIp),
        ).rejects.toThrow(new UnauthorizedError("Erro ao renovar token"));
      });
    });
  });
});
