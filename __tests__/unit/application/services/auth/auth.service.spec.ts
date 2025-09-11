import { randomUUID } from "crypto";

import {
  EntityNotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from "../../../../../src/application/errors";
import { AuthService } from "../../../../../src/application/services";
import {
  LoginInputDTO,
  RefreshTokenInputDTO,
} from "../../../../../src/domain/dtos/auth";
import {
  Military,
  User,
  UserRole,
  UserSession,
} from "../../../../../src/domain/entities";

// Mock crypto.randomUUID
jest.mock("crypto", () => ({
  randomUUID: jest.fn(),
}));

describe("AuthService", () => {
  let sut: AuthService;
  let mockUserRepository: any;
  let mockMilitaryRepository: any;
  let mockSessionRepository: any;
  let mockUserValidation: any;
  let mockUserSanitization: any;
  let mockPasswordHasher: any;
  let mockJwtService: any;
  let mockRateLimiter: any;
  let mockRandomUUID: jest.Mock;

  const mockMilitary: Military = {
    id: "military-123",
    rg: 12345,
    name: "John Doe",
    militaryRankId: "rank-123",
  };

  const mockUser: User = {
    id: "user-123",
    militaryId: "military-123",
    role: UserRole.ADMIN,
    password: "hashed-password",
  };

  const mockUserWithMilitary = {
    ...mockUser,
    military: mockMilitary,
  };

  const mockSession: UserSession = {
    id: "session-123",
    userId: "user-123",
    token: "access-token",
    refreshToken: "refresh-token",
    deviceInfo: "Test Device",
    ipAddress: "192.168.1.1",
    userAgent: "Test Agent",
    isActive: true,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    lastAccessAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock crypto.randomUUID
    mockRandomUUID = randomUUID as jest.Mock;
    mockRandomUUID.mockReturnValue("session-123");

    // Mock repositories
    mockUserRepository = {
      findByMilitaryIdWithPassword: jest.fn(),
      findById: jest.fn(),
    };

    mockMilitaryRepository = {
      findByRg: jest.fn(),
    };

    mockSessionRepository = {
      create: jest.fn(),
      findByRefreshToken: jest.fn(),
      findBySessionId: jest.fn(),
      deactivateAllUserSessions: jest.fn(),
      deactivateSession: jest.fn(),
      updateToken: jest.fn(),
      updateRefreshToken: jest.fn(),
    };

    // Mock services
    mockUserValidation = {
      validateUserExists: jest.fn(),
    };

    mockUserSanitization = {
      sanitizeUserCredentials: jest.fn(),
    };

    mockPasswordHasher = {
      compare: jest.fn(),
    };

    mockJwtService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    mockRateLimiter = {
      checkLimit: jest.fn(),
      recordAttempt: jest.fn(),
      reset: jest.fn(),
    };

    sut = new AuthService({
      userRepository: mockUserRepository,
      militaryRepository: mockMilitaryRepository,
      sessionRepository: mockSessionRepository,
      userValidation: mockUserValidation,
      userSanitization: mockUserSanitization,
      passwordHasher: mockPasswordHasher,
      jwtService: mockJwtService,
      rateLimiter: mockRateLimiter,
    });
  });

  describe("login", () => {
    const loginData: LoginInputDTO = {
      rg: 12345,
      password: "ValidPass@123",
      deviceInfo: "Test Device",
    };

    const ipAddress = "192.168.1.1";
    const userAgent = "Test Agent";

    const sanitizedCredentials = {
      rg: 12345,
      password: "ValidPass@123",
    };

    beforeEach(() => {
      // Default successful mocks
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remainingAttempts: 5,
        resetTime: new Date(Date.now() + 900000),
        totalAttempts: 0,
      });

      mockUserSanitization.sanitizeUserCredentials.mockReturnValue(
        sanitizedCredentials,
      );

      mockMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
      mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(
        mockUser,
      );
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockJwtService.generateAccessToken.mockReturnValue("access-token");
      mockJwtService.generateRefreshToken.mockReturnValue("refresh-token");
      mockSessionRepository.create.mockResolvedValue({
        id: "session-123",
        userId: "user-123",
        token: "temp",
        refreshToken: "temp",
        deviceInfo: "Test Device",
        ipAddress: "192.168.1.1",
        userAgent: "Test Agent",
        isActive: true,
        expiresAt: new Date(),
        createdAt: new Date(),
        lastAccessAt: new Date(),
      });
      mockSessionRepository.deactivateAllUserSessions.mockResolvedValue(
        undefined,
      );
      mockSessionRepository.updateToken.mockResolvedValue(undefined);
      mockSessionRepository.updateRefreshToken.mockResolvedValue(undefined);
      mockRateLimiter.recordAttempt.mockResolvedValue(undefined);
      mockRateLimiter.reset.mockResolvedValue(undefined);
    });

    it("should successfully login with valid credentials", async () => {
      const result = await sut.login(loginData, ipAddress, userAgent);

      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: {
          id: "user-123",
          militaryId: "military-123",
          role: UserRole.ADMIN,
        },
        expiresIn: 900, // 15 minutes in seconds
      });

      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        "login:ip:192.168.1.1",
        10,
        900000,
      );
      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        "login:rg:12345",
        5,
        900000,
      );
      expect(mockUserSanitization.sanitizeUserCredentials).toHaveBeenCalledWith(
        loginData,
      );
      expect(mockMilitaryRepository.findByRg).toHaveBeenCalledWith(12345);
      expect(
        mockUserRepository.findByMilitaryIdWithPassword,
      ).toHaveBeenCalledWith("military-123");
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        "ValidPass@123",
        "hashed-password",
      );
      expect(
        mockSessionRepository.deactivateAllUserSessions,
      ).toHaveBeenCalledWith("user-123");
      expect(mockRateLimiter.reset).toHaveBeenCalledWith(
        "login:ip:192.168.1.1",
      );
      expect(mockRateLimiter.reset).toHaveBeenCalledWith("login:rg:12345");
    });

    it("should throw TooManyRequestsError when IP rate limit exceeded", async () => {
      mockRateLimiter.checkLimit
        .mockResolvedValueOnce({
          allowed: false,
          remainingAttempts: 0,
          resetTime: new Date(Date.now() + 900000),
          totalAttempts: 10,
        })
        .mockResolvedValueOnce({
          allowed: true,
          remainingAttempts: 5,
          resetTime: new Date(Date.now() + 900000),
          totalAttempts: 0,
        });

      await expect(sut.login(loginData, ipAddress, userAgent)).rejects.toThrow(
        TooManyRequestsError,
      );

      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        "login:ip:192.168.1.1",
        10,
        900000,
      );
      expect(
        mockUserSanitization.sanitizeUserCredentials,
      ).not.toHaveBeenCalled();
    });

    it("should throw TooManyRequestsError when RG rate limit exceeded", async () => {
      mockRateLimiter.checkLimit
        .mockResolvedValueOnce({
          allowed: true,
          remainingAttempts: 5,
          resetTime: new Date(Date.now() + 900000),
          totalAttempts: 0,
        })
        .mockResolvedValueOnce({
          allowed: false,
          remainingAttempts: 0,
          resetTime: new Date(Date.now() + 900000),
          totalAttempts: 5,
        });

      await expect(sut.login(loginData, ipAddress, userAgent)).rejects.toThrow(
        TooManyRequestsError,
      );

      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        "login:rg:12345",
        5,
        900000,
      );
    });

    it("should throw UnauthorizedError when military not found", async () => {
      mockMilitaryRepository.findByRg.mockResolvedValue(null);

      await expect(sut.login(loginData, ipAddress, userAgent)).rejects.toThrow(
        new UnauthorizedError("Credenciais inválidas"),
      );

      expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith(
        "login:ip:192.168.1.1",
        900000,
      );
      expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith(
        "login:rg:12345",
        900000,
      );
    });

    it("should throw UnauthorizedError when user not found", async () => {
      mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(null);

      await expect(sut.login(loginData, ipAddress, userAgent)).rejects.toThrow(
        new UnauthorizedError("Credenciais inválidas"),
      );

      expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith(
        "login:ip:192.168.1.1",
        900000,
      );
      expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith(
        "login:rg:12345",
        900000,
      );
    });

    it("should throw UnauthorizedError when password does not match", async () => {
      mockPasswordHasher.compare.mockResolvedValue(false);

      await expect(sut.login(loginData, ipAddress, userAgent)).rejects.toThrow(
        new UnauthorizedError("Credenciais inválidas"),
      );

      expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith(
        "login:ip:192.168.1.1",
        900000,
      );
      expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith(
        "login:rg:12345",
        900000,
      );
    });

    it("should use userAgent as deviceInfo when deviceInfo is not provided", async () => {
      const loginDataWithoutDevice = {
        rg: 12345,
        password: "ValidPass@123",
      };

      await sut.login(loginDataWithoutDevice, ipAddress, userAgent);

      expect(mockSessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          deviceInfo: "Test Agent",
        }),
      );
    });

    it("should truncate userAgent to 100 characters when used as deviceInfo", async () => {
      const longUserAgent = "A".repeat(150);
      const loginDataWithoutDevice = {
        rg: 12345,
        password: "ValidPass@123",
      };

      await sut.login(loginDataWithoutDevice, ipAddress, longUserAgent);

      expect(mockSessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          deviceInfo: "A".repeat(100),
        }),
      );
    });

    it("should handle generic errors and record failed attempts", async () => {
      mockMilitaryRepository.findByRg.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(sut.login(loginData, ipAddress, userAgent)).rejects.toThrow(
        new UnauthorizedError("Erro no processo de autenticação"),
      );

      expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith(
        "login:ip:192.168.1.1",
        900000,
      );
      expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith(
        "login:rg:12345",
        900000,
      );
    });

    it("should not record attempts for TooManyRequestsError", async () => {
      const rateLimitError = new TooManyRequestsError("Rate limit exceeded");
      mockRateLimiter.checkLimit.mockRejectedValue(rateLimitError);

      await expect(sut.login(loginData, ipAddress, userAgent)).rejects.toThrow(
        rateLimitError,
      );

      expect(mockRateLimiter.recordAttempt).not.toHaveBeenCalled();
    });

    it("should generate session with correct expiry date", async () => {
      const mockDate = new Date("2023-01-01T00:00:00.000Z");
      const expectedExpiryDate = new Date("2023-01-08T00:00:00.000Z");

      const DateSpy = jest.spyOn(global, "Date");
      DateSpy.mockImplementation((() => mockDate) as any);

      await sut.login(loginData, ipAddress, userAgent);

      expect(mockSessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: expectedExpiryDate,
        }),
      );

      jest.restoreAllMocks();
    });
  });

  describe("refreshToken", () => {
    const refreshTokenData: RefreshTokenInputDTO = {
      refreshToken: "valid-refresh-token",
    };

    const ipAddress = "192.168.1.1";
    const userAgent = "Test Agent";

    beforeEach(() => {
      mockJwtService.verifyRefreshToken.mockReturnValue({
        userId: "user-123",
        sessionId: "session-123",
      });

      mockSessionRepository.findByRefreshToken.mockResolvedValue(mockSession);
      mockUserRepository.findById.mockResolvedValue(mockUserWithMilitary);
      mockJwtService.generateAccessToken.mockReturnValue("new-access-token");
      mockSessionRepository.updateToken.mockResolvedValue(undefined);
    });

    it("should successfully refresh token", async () => {
      const result = await sut.refreshToken(
        refreshTokenData,
        ipAddress,
        userAgent,
      );

      expect(result).toEqual({
        accessToken: "new-access-token",
        refreshToken: "valid-refresh-token",
        user: {
          id: "user-123",
          militaryId: "military-123",
          role: UserRole.ADMIN,
        },
        expiresIn: 900,
      });

      expect(mockJwtService.verifyRefreshToken).toHaveBeenCalledWith(
        "valid-refresh-token",
      );
      expect(mockSessionRepository.findByRefreshToken).toHaveBeenCalledWith(
        "valid-refresh-token",
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith("user-123");
      expect(mockJwtService.generateAccessToken).toHaveBeenCalledWith({
        userId: "user-123",
        sessionId: "session-123",
        role: UserRole.ADMIN,
        militaryId: "military-123",
      });
      expect(mockSessionRepository.updateToken).toHaveBeenCalledWith(
        "session-123",
        "new-access-token",
      );
    });

    it("should throw UnauthorizedError when session not found", async () => {
      mockSessionRepository.findByRefreshToken.mockResolvedValue(null);

      await expect(
        sut.refreshToken(refreshTokenData, ipAddress, userAgent),
      ).rejects.toThrow(new UnauthorizedError("Sessão inválida ou expirada"));
    });

    it("should throw UnauthorizedError when session is not active", async () => {
      mockSessionRepository.findByRefreshToken.mockResolvedValue({
        ...mockSession,
        isActive: false,
      });

      await expect(
        sut.refreshToken(refreshTokenData, ipAddress, userAgent),
      ).rejects.toThrow(new UnauthorizedError("Sessão inválida ou expirada"));
    });

    it("should throw UnauthorizedError and deactivate session when IP address changes", async () => {
      const differentIpAddress = "192.168.1.2";

      await expect(
        sut.refreshToken(refreshTokenData, differentIpAddress, userAgent),
      ).rejects.toThrow(new UnauthorizedError("Sessão comprometida detectada"));

      expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
        "session-123",
      );
    });

    it("should handle user agent changes without blocking (security log)", async () => {
      const differentUserAgent = "Different Agent";

      const result = await sut.refreshToken(
        refreshTokenData,
        ipAddress,
        differentUserAgent,
      );

      // Should still work but log suspicious activity
      expect(result.accessToken).toBe("new-access-token");
      expect(mockSessionRepository.deactivateSession).not.toHaveBeenCalled();
    });

    it("should throw EntityNotFoundError and deactivate session when user not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        sut.refreshToken(refreshTokenData, ipAddress, userAgent),
      ).rejects.toThrow(new EntityNotFoundError("Usuário"));

      expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
        "session-123",
      );
    });

    it("should handle JWT verification errors", async () => {
      mockJwtService.verifyRefreshToken.mockImplementation(() => {
        throw new UnauthorizedError("Invalid token");
      });

      await expect(
        sut.refreshToken(refreshTokenData, ipAddress, userAgent),
      ).rejects.toThrow(new UnauthorizedError("Invalid token"));
    });

    it("should handle generic errors", async () => {
      mockSessionRepository.findByRefreshToken.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        sut.refreshToken(refreshTokenData, ipAddress, userAgent),
      ).rejects.toThrow(new UnauthorizedError("Erro ao renovar token"));
    });
  });

  describe("logout", () => {
    it("should successfully logout by deactivating session", async () => {
      mockSessionRepository.deactivateSession.mockResolvedValue(undefined);

      await sut.logout("session-123");

      expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
        "session-123",
      );
    });

    it("should silently handle errors during logout", async () => {
      mockSessionRepository.deactivateSession.mockRejectedValue(
        new Error("Session not found"),
      );

      // Should not throw
      await expect(sut.logout("session-123")).resolves.toBeUndefined();

      expect(mockSessionRepository.deactivateSession).toHaveBeenCalledWith(
        "session-123",
      );
    });
  });

  describe("logoutAllSessions", () => {
    it("should successfully logout all user sessions", async () => {
      mockSessionRepository.deactivateAllUserSessions.mockResolvedValue(
        undefined,
      );

      await sut.logoutAllSessions("user-123");

      expect(
        mockSessionRepository.deactivateAllUserSessions,
      ).toHaveBeenCalledWith("user-123");
    });

    it("should silently handle errors during logout all sessions", async () => {
      mockSessionRepository.deactivateAllUserSessions.mockRejectedValue(
        new Error("User not found"),
      );

      // Should not throw
      await expect(sut.logoutAllSessions("user-123")).resolves.toBeUndefined();

      expect(
        mockSessionRepository.deactivateAllUserSessions,
      ).toHaveBeenCalledWith("user-123");
    });
  });

  describe("validateSession", () => {
    it("should return true for active session", async () => {
      mockSessionRepository.findBySessionId.mockResolvedValue(mockSession);

      const result = await sut.validateSession("session-123");

      expect(result).toBe(true);
      expect(mockSessionRepository.findBySessionId).toHaveBeenCalledWith(
        "session-123",
      );
    });

    it("should return false when session not found", async () => {
      mockSessionRepository.findBySessionId.mockResolvedValue(null);

      const result = await sut.validateSession("session-123");

      expect(result).toBe(false);
    });

    it("should return false when session is not active", async () => {
      mockSessionRepository.findBySessionId.mockResolvedValue({
        ...mockSession,
        isActive: false,
      });

      const result = await sut.validateSession("session-123");

      expect(result).toBe(false);
    });

    it("should return false when repository throws error", async () => {
      mockSessionRepository.findBySessionId.mockRejectedValue(
        new Error("Database error"),
      );

      const result = await sut.validateSession("session-123");

      expect(result).toBe(false);
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete login and refresh token flow", async () => {
      const loginData: LoginInputDTO = {
        rg: 12345,
        password: "ValidPass@123",
        deviceInfo: "Test Device",
      };

      // Setup login mocks
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remainingAttempts: 5,
        resetTime: new Date(Date.now() + 900000),
        totalAttempts: 0,
      });
      mockUserSanitization.sanitizeUserCredentials.mockReturnValue({
        rg: 12345,
        password: "ValidPass@123",
      });
      mockMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
      mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(
        mockUser,
      );
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockJwtService.generateAccessToken.mockReturnValue("access-token");
      mockJwtService.generateRefreshToken.mockReturnValue("refresh-token");
      mockSessionRepository.create.mockResolvedValue({
        id: "session-123",
        userId: "user-123",
        token: "temp",
        refreshToken: "temp",
        deviceInfo: "Test Device",
        ipAddress: "192.168.1.1",
        userAgent: "Test Agent",
        isActive: true,
        expiresAt: new Date(),
        createdAt: new Date(),
        lastAccessAt: new Date(),
      });
      mockSessionRepository.deactivateAllUserSessions.mockResolvedValue(
        undefined,
      );
      mockSessionRepository.updateToken.mockResolvedValue(undefined);
      mockSessionRepository.updateRefreshToken.mockResolvedValue(undefined);

      // Login
      const loginResult = await sut.login(
        loginData,
        "192.168.1.1",
        "Test Agent",
      );

      expect(loginResult.accessToken).toBe("access-token");
      expect(loginResult.refreshToken).toBe("refresh-token");

      // Setup refresh token mocks
      mockJwtService.verifyRefreshToken.mockReturnValue({
        userId: "user-123",
        sessionId: "session-123",
      });
      mockSessionRepository.findByRefreshToken.mockResolvedValue(mockSession);
      mockUserRepository.findById.mockResolvedValue(mockUserWithMilitary);
      mockJwtService.generateAccessToken.mockReturnValue("new-access-token");

      // Refresh token
      const refreshResult = await sut.refreshToken(
        { refreshToken: "refresh-token" },
        "192.168.1.1",
        "Test Agent",
      );

      expect(refreshResult.accessToken).toBe("new-access-token");
      expect(refreshResult.refreshToken).toBe("refresh-token");
    });

    it("should handle failed login with rate limiting", async () => {
      const loginData: LoginInputDTO = {
        rg: 12345,
        password: "InvalidPassword",
      };

      // Setup mocks
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remainingAttempts: 5,
        resetTime: new Date(Date.now() + 900000),
        totalAttempts: 0,
      });
      mockUserSanitization.sanitizeUserCredentials.mockReturnValue({
        rg: 12345,
        password: "InvalidPassword",
      });
      mockMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
      mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(
        mockUser,
      );
      mockPasswordHasher.compare.mockResolvedValue(false); // Wrong password

      await expect(
        sut.login(loginData, "192.168.1.1", "Test Agent"),
      ).rejects.toThrow(new UnauthorizedError("Credenciais inválidas"));

      expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith(
        "login:ip:192.168.1.1",
        900000,
      );
      expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith(
        "login:rg:12345",
        900000,
      );
      expect(mockRateLimiter.reset).not.toHaveBeenCalled();
    });
  });
});
