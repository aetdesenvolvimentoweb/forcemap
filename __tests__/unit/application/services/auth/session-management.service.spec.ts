import { TokenHandlerProtocol } from "../../../../../src/application/protocols";
import { SessionManagementService } from "../../../../../src/application/services/auth/session-management.service";
import {
  ACCESS_TOKEN_EXPIRY_SECONDS,
  MAX_DEVICE_INFO_LENGTH,
  SESSION_EXPIRY_DAYS,
} from "../../../../../src/domain/constants";
import {
  User,
  UserRole,
  UserSession,
} from "../../../../../src/domain/entities";
import { SessionRepository } from "../../../../../src/domain/repositories";

describe("SessionManagementService", () => {
  let sut: SessionManagementService;
  let mockSessionRepository: jest.Mocked<SessionRepository>;
  let mockTokenHandler: jest.Mocked<TokenHandlerProtocol>;

  const mockUser: User = {
    id: "user-123",
    militaryId: "mil-456",
    role: UserRole.BOMBEIRO,
    password: "hashed-password",
  };

  const mockIpAddress = "192.168.1.100";
  const mockUserAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
  const mockDeviceInfo = "Windows Desktop - Chrome";
  const mockAccessToken = "mock-access-token-jwt";
  const mockRefreshToken = "mock-refresh-token-jwt";

  beforeEach(() => {
    jest.clearAllMocks();

    mockSessionRepository = {
      create: jest.fn(),
      deactivateAllUserSessions: jest.fn(),
      deactivateSession: jest.fn(),
      findBySessionId: jest.fn(),
      findByRefreshToken: jest.fn(),
      findByToken: jest.fn(),
      findActiveByUserId: jest.fn(),
      updateLastAccess: jest.fn(),
      updateRefreshToken: jest.fn(),
      updateToken: jest.fn(),
      deleteExpiredSessions: jest.fn(),
    };

    mockTokenHandler = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      extractTokenFromHeader: jest.fn(),
    };

    sut = new SessionManagementService({
      sessionRepository: mockSessionRepository,
      tokenHandler: mockTokenHandler,
    });
  });

  describe("createSession()", () => {
    describe("Success cases", () => {
      it("should create a new session successfully", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        const result = await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(result).toEqual({
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
          sessionId: mockSession.id,
          expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
        });
      });

      it("should deactivate all user sessions before creating new one", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(
          mockSessionRepository.deactivateAllUserSessions,
        ).toHaveBeenCalledWith(mockUser.id);
        expect(
          mockSessionRepository.deactivateAllUserSessions,
        ).toHaveBeenCalled();
      });

      it("should create session with correct user ID", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(mockSessionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: mockUser.id,
          }),
        );
      });

      it("should create session with provided IP address", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(mockSessionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            ipAddress: mockIpAddress,
          }),
        );
      });

      it("should create session with provided user agent", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(mockSessionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userAgent: mockUserAgent,
          }),
        );
      });

      it("should create session with provided device info", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(mockSessionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            deviceInfo: mockDeviceInfo,
          }),
        );
      });

      it("should use user agent as device info when not provided", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockUserAgent.substring(0, MAX_DEVICE_INFO_LENGTH),
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          undefined,
        );

        expect(mockSessionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            deviceInfo: mockUserAgent.substring(0, MAX_DEVICE_INFO_LENGTH),
          }),
        );
      });

      it("should truncate user agent to MAX_DEVICE_INFO_LENGTH when used as device info", async () => {
        const longUserAgent = "A".repeat(200);
        const expectedDeviceInfo = longUserAgent.substring(
          0,
          MAX_DEVICE_INFO_LENGTH,
        );

        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: expectedDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: longUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(mockUser, mockIpAddress, longUserAgent);

        expect(mockSessionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            deviceInfo: expectedDeviceInfo,
          }),
        );
      });

      it("should create session with isActive set to true", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(mockSessionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            isActive: true,
          }),
        );
      });

      it("should create session with expiresAt set to SESSION_EXPIRY_DAYS in future", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        const beforeCall = new Date();
        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        const callArgs = mockSessionRepository.create.mock.calls[0][0];
        const expiresAt = callArgs.expiresAt;

        // Should be approximately SESSION_EXPIRY_DAYS days from now
        const expectedExpiry = new Date(beforeCall);
        expectedExpiry.setDate(expectedExpiry.getDate() + SESSION_EXPIRY_DAYS);

        const diffMs = Math.abs(expiresAt.getTime() - expectedExpiry.getTime());
        expect(diffMs).toBeLessThan(1000); // Within 1 second
      });

      it("should create session with pending tokens initially", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(mockSessionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            token: "pending",
            refreshToken: "pending",
          }),
        );
      });
    });

    describe("Token generation", () => {
      it("should generate access token with correct payload", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(mockTokenHandler.generateAccessToken).toHaveBeenCalledWith({
          userId: mockUser.id,
          sessionId: mockSession.id,
          role: mockUser.role,
          militaryId: mockUser.militaryId,
        });
      });

      it("should generate refresh token with correct payload", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(mockTokenHandler.generateRefreshToken).toHaveBeenCalledWith({
          userId: mockUser.id,
          sessionId: mockSession.id,
        });
      });

      it("should generate tokens after session is created", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        // Verify both were called
        expect(mockSessionRepository.create).toHaveBeenCalled();
        expect(mockTokenHandler.generateAccessToken).toHaveBeenCalled();
        expect(mockTokenHandler.generateRefreshToken).toHaveBeenCalled();
      });

      it("should update session with access token after generation", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(mockSessionRepository.updateToken).toHaveBeenCalledWith(
          mockSession.id,
          mockAccessToken,
        );
      });

      it("should update session with refresh token after generation", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(mockSessionRepository.updateRefreshToken).toHaveBeenCalledWith(
          mockSession.id,
          mockRefreshToken,
        );
      });

      it("should return ACCESS_TOKEN_EXPIRY_SECONDS in response", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        const result = await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(result.expiresIn).toBe(ACCESS_TOKEN_EXPIRY_SECONDS);
      });
    });

    describe("Different user roles", () => {
      it("should create session for ADMIN user", async () => {
        const adminUser: User = { ...mockUser, role: UserRole.ADMIN };

        const mockSession: UserSession = {
          id: "session-123",
          userId: adminUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        const result = await sut.createSession(
          adminUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(mockTokenHandler.generateAccessToken).toHaveBeenCalledWith(
          expect.objectContaining({
            role: UserRole.ADMIN,
          }),
        );
        expect(result.accessToken).toBe(mockAccessToken);
      });

      it("should create session for CHEFE user", async () => {
        const chefeUser: User = { ...mockUser, role: UserRole.CHEFE };

        const mockSession: UserSession = {
          id: "session-123",
          userId: chefeUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          chefeUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(mockTokenHandler.generateAccessToken).toHaveBeenCalledWith(
          expect.objectContaining({
            role: UserRole.CHEFE,
          }),
        );
      });

      it("should create session for ACA user", async () => {
        const acaUser: User = { ...mockUser, role: UserRole.ACA };

        const mockSession: UserSession = {
          id: "session-123",
          userId: acaUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          acaUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(mockTokenHandler.generateAccessToken).toHaveBeenCalledWith(
          expect.objectContaining({
            role: UserRole.ACA,
          }),
        );
      });
    });

    describe("Edge cases", () => {
      it("should handle IPv6 addresses", async () => {
        const ipv6 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";

        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: ipv6,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(mockUser, ipv6, mockUserAgent, mockDeviceInfo);

        expect(mockSessionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            ipAddress: ipv6,
          }),
        );
      });

      it("should handle empty user agent", async () => {
        const emptyUserAgent = "";

        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: "",
          ipAddress: mockIpAddress,
          userAgent: emptyUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          emptyUserAgent,
          undefined,
        );

        expect(mockSessionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userAgent: emptyUserAgent,
            deviceInfo: emptyUserAgent,
          }),
        );
      });

      it("should handle very long device info", async () => {
        const longDeviceInfo = "A".repeat(200);

        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: longDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        const result = await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          longDeviceInfo,
        );

        expect(mockSessionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            deviceInfo: longDeviceInfo,
          }),
        );
        expect(result.sessionId).toBe(mockSession.id);
      });

      it("should handle special characters in device info", async () => {
        const specialDeviceInfo = "Device-123_@#$%^&*()";

        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: specialDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          specialDeviceInfo,
        );

        expect(mockSessionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            deviceInfo: specialDeviceInfo,
          }),
        );
      });
    });

    describe("Complete flow verification", () => {
      it("should call all required operations", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        // Verify all operations were called
        expect(
          mockSessionRepository.deactivateAllUserSessions,
        ).toHaveBeenCalled();
        expect(mockSessionRepository.create).toHaveBeenCalled();
        expect(mockTokenHandler.generateAccessToken).toHaveBeenCalled();
        expect(mockTokenHandler.generateRefreshToken).toHaveBeenCalled();
        expect(mockSessionRepository.updateToken).toHaveBeenCalled();
        expect(mockSessionRepository.updateRefreshToken).toHaveBeenCalled();
      });

      it("should call all expected methods exactly once", async () => {
        const mockSession: UserSession = {
          id: "session-123",
          userId: mockUser.id,
          token: "pending",
          refreshToken: "pending",
          deviceInfo: mockDeviceInfo,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          isActive: true,
          expiresAt: new Date(),
          createdAt: new Date(),
          lastAccessAt: new Date(),
        };

        mockSessionRepository.create.mockResolvedValueOnce(mockSession);
        mockTokenHandler.generateAccessToken.mockReturnValueOnce(
          mockAccessToken,
        );
        mockTokenHandler.generateRefreshToken.mockReturnValueOnce(
          mockRefreshToken,
        );

        await sut.createSession(
          mockUser,
          mockIpAddress,
          mockUserAgent,
          mockDeviceInfo,
        );

        expect(
          mockSessionRepository.deactivateAllUserSessions,
        ).toHaveBeenCalledTimes(1);
        expect(mockSessionRepository.create).toHaveBeenCalledTimes(1);
        expect(mockTokenHandler.generateAccessToken).toHaveBeenCalledTimes(1);
        expect(mockTokenHandler.generateRefreshToken).toHaveBeenCalledTimes(1);
        expect(mockSessionRepository.updateToken).toHaveBeenCalledTimes(1);
        expect(mockSessionRepository.updateRefreshToken).toHaveBeenCalledTimes(
          1,
        );
      });
    });
  });
});
