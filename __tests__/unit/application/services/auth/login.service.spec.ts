import {
  TooManyRequestsError,
  UnauthorizedError,
} from "../../../../../src/application/errors";
import {
  PasswordHasherProtocol,
  RateLimiterProtocol,
  RateLimiterResult,
  TokenHandlerProtocol,
  UserCredentialsInputDTOSanitizerProtocol,
} from "../../../../../src/application/protocols";
import { LoginService } from "../../../../../src/application/services/auth/login.service";
import {
  LoginInputDTO,
  LoginOutputDTO,
} from "../../../../../src/domain/dtos/auth";
import { User, UserRole } from "../../../../../src/domain/entities";
import {
  MilitaryRepository,
  SessionRepository,
  UserRepository,
} from "../../../../../src/domain/repositories";

describe("LoginService", () => {
  let sut: LoginService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockMilitaryRepository: jest.Mocked<MilitaryRepository>;
  let mockSessionRepository: jest.Mocked<SessionRepository>;
  let mockTokenHandler: jest.Mocked<TokenHandlerProtocol>;
  let mockUserCredentialsInputDTOSanitizer: jest.Mocked<UserCredentialsInputDTOSanitizerProtocol>;
  let mockPasswordHasher: jest.Mocked<PasswordHasherProtocol>;
  let mockRateLimiter: jest.Mocked<RateLimiterProtocol>;

  const mockMilitary = {
    id: "mil-123",
    militaryRank: {
      id: "rank-123",
      abbreviation: "Cap",
      order: 5,
    },
    rg: 123456789,
    name: "João Silva",
  };

  const mockUser: User = {
    id: "user-123",
    militaryId: "mil-123",
    role: UserRole.ADMIN,
    password: "hashed-password",
  };

  const mockSession = {
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

  const mockLoginInput: LoginInputDTO = {
    rg: 123456789,
    password: "plain-password",
    deviceInfo: "Test Device",
  };

  const mockSanitizedCredentials = {
    rg: 123456789,
    password: "plain-password",
  };

  const mockIpAddress = "192.168.1.1";
  const mockUserAgent = "Test Agent";
  const mockAccessToken = "new-access-token";
  const mockRefreshToken = "new-refresh-token";

  const mockAllowedRateLimit: RateLimiterResult = {
    allowed: true,
    remainingAttempts: 9,
    resetTime: new Date(Date.now() + 15 * 60 * 1000),
    totalAttempts: 1,
  };

  const mockBlockedRateLimit: RateLimiterResult = {
    allowed: false,
    remainingAttempts: 0,
    resetTime: new Date(Date.now() + 15 * 60 * 1000),
    totalAttempts: 10,
  };

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

    mockMilitaryRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByRg: jest.fn(),
      listAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

    mockUserCredentialsInputDTOSanitizer = {
      sanitize: jest.fn(),
    };

    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    mockRateLimiter = {
      checkLimit: jest.fn(),
      recordAttempt: jest.fn(),
      reset: jest.fn(),
      isBlocked: jest.fn(),
    };

    sut = new LoginService({
      userRepository: mockUserRepository,
      militaryRepository: mockMilitaryRepository,
      sessionRepository: mockSessionRepository,
      tokenHandler: mockTokenHandler,
      userCredentialsInputDTOSanitizer: mockUserCredentialsInputDTOSanitizer,
      passwordHasher: mockPasswordHasher,
      rateLimiter: mockRateLimiter,
    });
  });

  describe("constructor", () => {
    it("should create instance successfully", () => {
      expect(sut).toBeInstanceOf(LoginService);
      expect(sut.authenticate).toBeDefined();
    });
  });

  describe("authenticate", () => {
    const setupSuccessfulMocks = () => {
      mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(
        mockSanitizedCredentials,
      );
      mockRateLimiter.checkLimit.mockResolvedValue(mockAllowedRateLimit);
      mockMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
      mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(
        mockUser,
      );
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockSessionRepository.deactivateAllUserSessions.mockResolvedValue();
      mockSessionRepository.create.mockResolvedValue(mockSession);
      mockTokenHandler.generateAccessToken.mockReturnValue(mockAccessToken);
      mockTokenHandler.generateRefreshToken.mockReturnValue(mockRefreshToken);
      mockSessionRepository.updateToken.mockResolvedValue();
      mockSessionRepository.updateRefreshToken.mockResolvedValue();
      mockRateLimiter.reset.mockResolvedValue();
    };

    it("should authenticate user successfully", async () => {
      setupSuccessfulMocks();

      const result: LoginOutputDTO = await sut.authenticate(
        mockLoginInput,
        mockIpAddress,
        mockUserAgent,
      );

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        user: {
          id: mockUser.id,
          militaryId: mockUser.militaryId,
          role: mockUser.role,
        },
        expiresIn: 15 * 60,
      });
    });

    it("should call all dependencies in correct order", async () => {
      setupSuccessfulMocks();

      await sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent);

      expect(
        mockUserCredentialsInputDTOSanitizer.sanitize,
      ).toHaveBeenCalledWith(mockLoginInput);
      expect(mockRateLimiter.checkLimit).toHaveBeenCalledTimes(2); // IP and RG limits
      expect(mockMilitaryRepository.findByRg).toHaveBeenCalledWith(
        mockSanitizedCredentials.rg,
      );
      expect(
        mockUserRepository.findByMilitaryIdWithPassword,
      ).toHaveBeenCalledWith(mockMilitary.id);
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        mockSanitizedCredentials.password,
        mockUser.password,
      );
      expect(
        mockSessionRepository.deactivateAllUserSessions,
      ).toHaveBeenCalledWith(mockUser.id);
      expect(mockRateLimiter.reset).toHaveBeenCalledTimes(2); // Reset both IP and RG limits
    });

    describe("rate limiting", () => {
      beforeEach(() => {
        mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(
          mockSanitizedCredentials,
        );
      });

      it("should throw TooManyRequestsError when IP limit is exceeded", async () => {
        const ipBlockedLimit = {
          ...mockBlockedRateLimit,
          resetTime: new Date(Date.now() + 5 * 60 * 1000),
        };
        mockRateLimiter.checkLimit
          .mockResolvedValueOnce(ipBlockedLimit) // IP limit blocked
          .mockResolvedValueOnce(mockAllowedRateLimit); // RG limit allowed

        await expect(
          sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent),
        ).rejects.toThrow(
          new TooManyRequestsError(
            "Muitas tentativas de login. Tente novamente em 5 minutos.",
          ),
        );

        expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
          `login:ip:${mockIpAddress}`,
          10,
          15 * 60 * 1000,
        );
      });

      it("should throw TooManyRequestsError when RG limit is exceeded", async () => {
        const rgBlockedLimit = {
          ...mockBlockedRateLimit,
          resetTime: new Date(Date.now() + 3 * 60 * 1000),
        };
        mockRateLimiter.checkLimit
          .mockResolvedValueOnce(mockAllowedRateLimit) // IP limit allowed
          .mockResolvedValueOnce(rgBlockedLimit); // RG limit blocked

        await expect(
          sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent),
        ).rejects.toThrow(
          new TooManyRequestsError(
            "Muitas tentativas para este usuário. Tente novamente em 3 minutos.",
          ),
        );

        expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
          `login:rg:${mockSanitizedCredentials.rg}`,
          5,
          15 * 60 * 1000,
        );
      });

      it("should calculate remaining minutes correctly", async () => {
        const resetTime = new Date(Date.now() + 7.8 * 60 * 1000); // 7.8 minutes
        const ipBlockedLimit = { ...mockBlockedRateLimit, resetTime };
        mockRateLimiter.checkLimit.mockResolvedValueOnce(ipBlockedLimit);

        await expect(
          sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent),
        ).rejects.toThrow(
          new TooManyRequestsError(
            "Muitas tentativas de login. Tente novamente em 8 minutos.",
          ),
        );
      });
    });

    describe("credential validation", () => {
      beforeEach(() => {
        mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(
          mockSanitizedCredentials,
        );
        mockRateLimiter.checkLimit.mockResolvedValue(mockAllowedRateLimit);
      });

      it("should throw UnauthorizedError when military is not found", async () => {
        mockMilitaryRepository.findByRg.mockResolvedValue(null);

        await expect(
          sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent),
        ).rejects.toThrow(new UnauthorizedError("Credenciais inválidas"));

        expect(mockRateLimiter.recordAttempt).toHaveBeenCalledTimes(2);
        expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith(
          `login:ip:${mockIpAddress}`,
          15 * 60 * 1000,
        );
        expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith(
          `login:rg:${mockSanitizedCredentials.rg}`,
          15 * 60 * 1000,
        );
      });

      it("should throw UnauthorizedError when user is not found", async () => {
        mockMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
        mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(null);

        await expect(
          sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent),
        ).rejects.toThrow(new UnauthorizedError("Credenciais inválidas"));

        expect(mockRateLimiter.recordAttempt).toHaveBeenCalledTimes(2);
      });

      it("should throw UnauthorizedError when password does not match", async () => {
        mockMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
        mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(
          mockUser,
        );
        mockPasswordHasher.compare.mockResolvedValue(false);

        await expect(
          sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent),
        ).rejects.toThrow(new UnauthorizedError("Credenciais inválidas"));

        expect(mockRateLimiter.recordAttempt).toHaveBeenCalledTimes(2);
      });
    });

    describe("session creation", () => {
      beforeEach(() => {
        mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(
          mockSanitizedCredentials,
        );
        mockRateLimiter.checkLimit.mockResolvedValue(mockAllowedRateLimit);
        mockMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
        mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(
          mockUser,
        );
        mockPasswordHasher.compare.mockResolvedValue(true);
      });

      it("should deactivate all existing user sessions", async () => {
        setupSuccessfulMocks();

        await sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent);

        expect(
          mockSessionRepository.deactivateAllUserSessions,
        ).toHaveBeenCalledWith(mockUser.id);
      });

      it("should create session with correct data", async () => {
        setupSuccessfulMocks();

        await sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent);

        expect(mockSessionRepository.create).toHaveBeenCalledWith({
          userId: mockUser.id,
          token: "temp",
          refreshToken: "temp",
          deviceInfo: mockLoginInput.deviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: expect.any(Date),
        });
      });

      it("should use user agent as device info when not provided", async () => {
        setupSuccessfulMocks();
        const loginInputWithoutDevice = {
          ...mockLoginInput,
          deviceInfo: undefined,
        };

        await sut.authenticate(
          loginInputWithoutDevice,
          mockIpAddress,
          mockUserAgent,
        );

        expect(mockSessionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            deviceInfo: mockUserAgent.substring(0, 100),
          }),
        );
      });

      it("should truncate very long user agent", async () => {
        setupSuccessfulMocks();
        const longUserAgent = "a".repeat(150);
        const loginInputWithoutDevice = {
          ...mockLoginInput,
          deviceInfo: undefined,
        };

        await sut.authenticate(
          loginInputWithoutDevice,
          mockIpAddress,
          longUserAgent,
        );

        expect(mockSessionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            deviceInfo: longUserAgent.substring(0, 100),
          }),
        );
      });

      it("should generate tokens with correct payload", async () => {
        setupSuccessfulMocks();

        await sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent);

        expect(mockTokenHandler.generateAccessToken).toHaveBeenCalledWith({
          userId: mockUser.id,
          sessionId: mockSession.id,
          role: mockUser.role,
          militaryId: mockUser.militaryId,
        });

        expect(mockTokenHandler.generateRefreshToken).toHaveBeenCalledWith({
          userId: mockUser.id,
          sessionId: mockSession.id,
        });
      });

      it("should update session with generated tokens", async () => {
        setupSuccessfulMocks();

        await sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent);

        expect(mockSessionRepository.updateToken).toHaveBeenCalledWith(
          mockSession.id,
          mockAccessToken,
        );
        expect(mockSessionRepository.updateRefreshToken).toHaveBeenCalledWith(
          mockSession.id,
          mockRefreshToken,
        );
      });

      it("should set session expiration to 7 days", async () => {
        setupSuccessfulMocks();

        await sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent);

        const createCall = mockSessionRepository.create.mock.calls[0][0];
        const expiresAt = createCall.expiresAt;
        const now = new Date();
        const expectedExpiry = new Date(now);
        expectedExpiry.setDate(expectedExpiry.getDate() + 7);

        expect(expiresAt.getDate()).toBe(expectedExpiry.getDate());
      });
    });

    describe("rate limit reset on success", () => {
      it("should reset rate limits after successful authentication", async () => {
        setupSuccessfulMocks();

        await sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent);

        expect(mockRateLimiter.reset).toHaveBeenCalledWith(
          `login:ip:${mockIpAddress}`,
        );
        expect(mockRateLimiter.reset).toHaveBeenCalledWith(
          `login:rg:${mockSanitizedCredentials.rg}`,
        );
        expect(mockRateLimiter.reset).toHaveBeenCalledTimes(2);
      });
    });

    describe("error handling", () => {
      beforeEach(() => {
        mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(
          mockSanitizedCredentials,
        );
        mockRateLimiter.checkLimit.mockResolvedValue(mockAllowedRateLimit);
      });

      it("should re-throw TooManyRequestsError without modification", async () => {
        const rateLimitError = new TooManyRequestsError("Rate limit exceeded");
        mockRateLimiter.checkLimit.mockRejectedValueOnce(rateLimitError);

        await expect(
          sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent),
        ).rejects.toThrow(rateLimitError);
      });

      it("should re-throw UnauthorizedError without modification", async () => {
        const unauthorizedError = new UnauthorizedError("Invalid credentials");
        mockMilitaryRepository.findByRg.mockRejectedValueOnce(
          unauthorizedError,
        );

        await expect(
          sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent),
        ).rejects.toThrow(unauthorizedError);
      });

      it("should wrap unexpected errors and record failed attempt", async () => {
        const unexpectedError = new Error("Database connection failed");
        mockMilitaryRepository.findByRg.mockRejectedValueOnce(unexpectedError);

        await expect(
          sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent),
        ).rejects.toThrow(
          new UnauthorizedError("Erro no processo de autenticação"),
        );

        expect(mockRateLimiter.recordAttempt).toHaveBeenCalledTimes(2);
      });

      it("should handle session creation failures", async () => {
        mockMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
        mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(
          mockUser,
        );
        mockPasswordHasher.compare.mockResolvedValue(true);
        mockSessionRepository.deactivateAllUserSessions.mockResolvedValue();
        mockSessionRepository.create.mockRejectedValue(
          new Error("Session creation failed"),
        );

        await expect(
          sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent),
        ).rejects.toThrow(
          new UnauthorizedError("Erro no processo de autenticação"),
        );

        expect(mockRateLimiter.recordAttempt).toHaveBeenCalledTimes(2);
      });

      it("should handle token generation failures", async () => {
        mockMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
        mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(
          mockUser,
        );
        mockPasswordHasher.compare.mockResolvedValue(true);
        mockSessionRepository.deactivateAllUserSessions.mockResolvedValue();
        mockSessionRepository.create.mockResolvedValue(mockSession);
        mockTokenHandler.generateAccessToken.mockImplementation(() => {
          throw new Error("Token generation failed");
        });

        await expect(
          sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent),
        ).rejects.toThrow(
          new UnauthorizedError("Erro no processo de autenticação"),
        );
      });
    });

    describe("edge cases", () => {
      it("should handle empty device info by using user agent", async () => {
        setupSuccessfulMocks();
        const loginWithEmptyDevice = { ...mockLoginInput, deviceInfo: "" };

        await sut.authenticate(
          loginWithEmptyDevice,
          mockIpAddress,
          mockUserAgent,
        );

        expect(mockSessionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            deviceInfo: mockUserAgent.substring(0, 100),
          }),
        );
      });

      it("should handle very long device info", async () => {
        setupSuccessfulMocks();
        const longDeviceInfo = "a".repeat(500);
        const loginWithLongDevice = {
          ...mockLoginInput,
          deviceInfo: longDeviceInfo,
        };

        await sut.authenticate(
          loginWithLongDevice,
          mockIpAddress,
          mockUserAgent,
        );

        expect(mockSessionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            deviceInfo: longDeviceInfo,
          }),
        );
      });

      it("should handle different user roles", async () => {
        const adminUser = { ...mockUser, role: UserRole.ADMIN };
        const chefeUser = { ...mockUser, role: UserRole.CHEFE };

        mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(
          mockSanitizedCredentials,
        );
        mockRateLimiter.checkLimit.mockResolvedValue(mockAllowedRateLimit);
        mockMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
        mockPasswordHasher.compare.mockResolvedValue(true);
        mockSessionRepository.deactivateAllUserSessions.mockResolvedValue();
        mockSessionRepository.create.mockResolvedValue(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValue(mockAccessToken);
        mockTokenHandler.generateRefreshToken.mockReturnValue(mockRefreshToken);
        mockSessionRepository.updateToken.mockResolvedValue();
        mockSessionRepository.updateRefreshToken.mockResolvedValue();
        mockRateLimiter.reset.mockResolvedValue();

        mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValueOnce(
          adminUser,
        );
        const adminResult = await sut.authenticate(
          mockLoginInput,
          mockIpAddress,
          mockUserAgent,
        );
        expect(adminResult.user.role).toBe(UserRole.ADMIN);

        mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValueOnce(
          chefeUser,
        );
        const chefeResult = await sut.authenticate(
          mockLoginInput,
          mockIpAddress,
          mockUserAgent,
        );
        expect(chefeResult.user.role).toBe(UserRole.CHEFE);
      });
    });

    describe("sanitization", () => {
      it("should sanitize input data before processing", async () => {
        const unsanitizedInput = { ...mockLoginInput, rg: 123456789 };
        const sanitizedOutput = { rg: 123456789, password: "cleaned-password" };

        // Setup mocks with sanitized data
        mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(
          sanitizedOutput,
        );
        mockRateLimiter.checkLimit.mockResolvedValue(mockAllowedRateLimit);
        mockMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
        mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(
          mockUser,
        );
        mockPasswordHasher.compare.mockResolvedValue(true);
        mockSessionRepository.deactivateAllUserSessions.mockResolvedValue();
        mockSessionRepository.create.mockResolvedValue(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValue(mockAccessToken);
        mockTokenHandler.generateRefreshToken.mockReturnValue(mockRefreshToken);
        mockSessionRepository.updateToken.mockResolvedValue();
        mockSessionRepository.updateRefreshToken.mockResolvedValue();
        mockRateLimiter.reset.mockResolvedValue();

        await sut.authenticate(unsanitizedInput, mockIpAddress, mockUserAgent);

        expect(
          mockUserCredentialsInputDTOSanitizer.sanitize,
        ).toHaveBeenCalledWith(unsanitizedInput);
        expect(mockMilitaryRepository.findByRg).toHaveBeenCalledWith(
          sanitizedOutput.rg,
        );
        expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
          sanitizedOutput.password,
          mockUser.password,
        );
      });
    });
  });
});
