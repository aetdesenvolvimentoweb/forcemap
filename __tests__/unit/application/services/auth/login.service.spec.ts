import {
  TooManyRequestsError,
  UnauthorizedError,
} from "../../../../../src/application/errors";
import {
  PasswordHasherProtocol,
  SecurityLoggerProtocol,
  UserCredentialsInputDTOSanitizerProtocol,
} from "../../../../../src/application/protocols";
import { LoginService } from "../../../../../src/application/services/auth/login.service";
import { RateLimitingService } from "../../../../../src/application/services/auth/rate-limiting.service";
import { SessionManagementService } from "../../../../../src/application/services/auth/session-management.service";
import {
  LoginInputDTO,
  LoginOutputDTO,
} from "../../../../../src/domain/dtos/auth";
import { User, UserRole } from "../../../../../src/domain/entities";
import {
  MilitaryRepository,
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

describe("LoginService", () => {
  let sut: LoginService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockMilitaryRepository: jest.Mocked<MilitaryRepository>;
  let mockUserCredentialsInputDTOSanitizer: jest.Mocked<UserCredentialsInputDTOSanitizerProtocol>;
  let mockPasswordHasher: jest.Mocked<PasswordHasherProtocol>;
  let mockRateLimitingService: jest.Mocked<RateLimitingService>;
  let mockSessionManagementService: jest.Mocked<SessionManagementService>;
  let mockSecurityLogger: jest.Mocked<SecurityLoggerProtocol>;

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

    mockUserCredentialsInputDTOSanitizer = {
      sanitize: jest.fn(),
    };

    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    mockSecurityLogger = {
      logLogin: jest.fn(),
      logLoginBlocked: jest.fn(),
      logLogout: jest.fn(),
      logTokenRefresh: jest.fn(),
      logAccessDenied: jest.fn(),
      logSuspiciousActivity: jest.fn(),
    };

    mockRateLimitingService = {
      validateLoginAttempt: jest.fn(),
      recordFailedAttempt: jest.fn(),
      resetLimits: jest.fn(),
    } as any;

    mockSessionManagementService = {
      createSession: jest.fn(),
    } as any;

    sut = new LoginService({
      userRepository: mockUserRepository,
      militaryRepository: mockMilitaryRepository,
      userCredentialsInputDTOSanitizer: mockUserCredentialsInputDTOSanitizer,
      passwordHasher: mockPasswordHasher,
      rateLimitingService: mockRateLimitingService,
      sessionManagementService: mockSessionManagementService,
      securityLogger: mockSecurityLogger,
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
      mockRateLimitingService.validateLoginAttempt.mockResolvedValue({
        ipLimitKey: "login:ip:192.168.1.1",
        rgLimitKey: "login:rg:123456789",
      });
      mockMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
      mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(
        mockUser,
      );
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockSessionManagementService.createSession.mockResolvedValue({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        sessionId: mockSession.id,
        expiresIn: 15 * 60,
      });
      mockRateLimitingService.resetLimits.mockResolvedValue();
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
      expect(mockRateLimitingService.validateLoginAttempt).toHaveBeenCalledWith(
        mockIpAddress,
        mockSanitizedCredentials.rg,
      );
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
      expect(mockSessionManagementService.createSession).toHaveBeenCalledWith(
        mockUser,
        mockIpAddress,
        mockUserAgent,
        mockLoginInput.deviceInfo,
      );
      expect(mockRateLimitingService.resetLimits).toHaveBeenCalled();
    });

    describe("rate limiting", () => {
      beforeEach(() => {
        mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(
          mockSanitizedCredentials,
        );
      });

      it("should throw TooManyRequestsError when rate limit is exceeded", async () => {
        mockRateLimitingService.validateLoginAttempt.mockRejectedValue(
          new TooManyRequestsError(
            "Muitas tentativas de login. Tente novamente em 5 minutos.",
          ),
        );

        await expect(
          sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent),
        ).rejects.toThrow(TooManyRequestsError);

        expect(
          mockRateLimitingService.validateLoginAttempt,
        ).toHaveBeenCalledWith(mockIpAddress, mockSanitizedCredentials.rg);
      });
    });

    describe("credential validation", () => {
      beforeEach(() => {
        mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(
          mockSanitizedCredentials,
        );
        mockRateLimitingService.validateLoginAttempt.mockResolvedValue({
          ipLimitKey: "login:ip:192.168.1.1",
          rgLimitKey: "login:rg:123456789",
        });
      });

      it("should throw UnauthorizedError when military is not found", async () => {
        mockMilitaryRepository.findByRg.mockResolvedValue(null);

        await expect(
          sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent),
        ).rejects.toThrow(new UnauthorizedError("Credenciais inválidas"));

        expect(mockRateLimitingService.recordFailedAttempt).toHaveBeenCalled();
      });

      it("should throw UnauthorizedError when user is not found", async () => {
        mockMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
        mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(null);

        await expect(
          sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent),
        ).rejects.toThrow(new UnauthorizedError("Credenciais inválidas"));

        expect(mockRateLimitingService.recordFailedAttempt).toHaveBeenCalled();
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

        expect(mockRateLimitingService.recordFailedAttempt).toHaveBeenCalled();
      });
    });

    describe("session creation", () => {
      beforeEach(() => {
        setupSuccessfulMocks();
      });

      it("should delegate session creation to SessionManagementService", async () => {
        await sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent);

        expect(mockSessionManagementService.createSession).toHaveBeenCalledWith(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockLoginInput.deviceInfo,
        );
      });
    });

    describe("rate limit reset on success", () => {
      it("should reset rate limits after successful authentication", async () => {
        setupSuccessfulMocks();

        await sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent);

        expect(mockRateLimitingService.resetLimits).toHaveBeenCalledWith({
          ipLimitKey: "login:ip:192.168.1.1",
          rgLimitKey: "login:rg:123456789",
        });
      });
    });

    describe("error handling", () => {
      beforeEach(() => {
        mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(
          mockSanitizedCredentials,
        );
        mockRateLimitingService.validateLoginAttempt.mockResolvedValue({
          ipLimitKey: "login:ip:192.168.1.1",
          rgLimitKey: "login:rg:123456789",
        });
      });

      it("should re-throw TooManyRequestsError without modification", async () => {
        const rateLimitError = new TooManyRequestsError("Rate limit exceeded");
        mockRateLimitingService.validateLoginAttempt.mockRejectedValueOnce(
          rateLimitError,
        );

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

        expect(mockRateLimitingService.recordFailedAttempt).toHaveBeenCalled();
      });

      it("should handle session creation failures", async () => {
        mockRateLimitingService.validateLoginAttempt.mockResolvedValue({
          ipLimitKey: "login:ip:192.168.1.1",
          rgLimitKey: "login:rg:123456789",
        });
        mockMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
        mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(
          mockUser,
        );
        mockPasswordHasher.compare.mockResolvedValue(true);
        mockSessionManagementService.createSession.mockRejectedValue(
          new Error("Session creation failed"),
        );

        await expect(
          sut.authenticate(mockLoginInput, mockIpAddress, mockUserAgent),
        ).rejects.toThrow(
          new UnauthorizedError("Erro no processo de autenticação"),
        );

        expect(mockRateLimitingService.recordFailedAttempt).toHaveBeenCalled();
      });
    });

    describe("edge cases", () => {
      it("should handle different user roles", async () => {
        const adminUser = { ...mockUser, role: UserRole.ADMIN };
        const chefeUser = { ...mockUser, role: UserRole.CHEFE };

        setupSuccessfulMocks();

        mockUserRepository.findByMilitaryIdWithPassword.mockResolvedValueOnce(
          adminUser,
        );
        const adminResult = await sut.authenticate(
          mockLoginInput,
          mockIpAddress,
          mockUserAgent,
        );
        expect(adminResult.user.role).toBe(UserRole.ADMIN);

        setupSuccessfulMocks();
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

        setupSuccessfulMocks();
        mockUserCredentialsInputDTOSanitizer.sanitize.mockReturnValue(
          sanitizedOutput,
        );

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
