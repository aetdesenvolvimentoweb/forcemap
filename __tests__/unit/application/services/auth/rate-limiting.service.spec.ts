import { TooManyRequestsError } from "../../../../../src/application/errors";
import {
  RateLimiterProtocol,
  RateLimiterResult,
  SecurityLoggerProtocol,
} from "../../../../../src/application/protocols";
import { RateLimitingService } from "../../../../../src/application/services/auth/rate-limiting.service";
import {
  DEFAULT_LOGIN_IP_MAX_ATTEMPTS,
  DEFAULT_LOGIN_USER_MAX_ATTEMPTS,
  DEFAULT_LOGIN_WINDOW_MS,
} from "../../../../../src/domain/constants";

describe("RateLimitingService", () => {
  let sut: RateLimitingService;
  let mockRateLimiter: jest.Mocked<RateLimiterProtocol>;
  let mockSecurityLogger: jest.Mocked<SecurityLoggerProtocol>;

  const mockIpAddress = "192.168.1.1";
  const mockRg = 123456789;

  beforeEach(() => {
    // Clear environment variables
    delete process.env.RATE_LIMIT_LOGIN_IP_MAX_ATTEMPTS;
    delete process.env.RATE_LIMIT_LOGIN_USER_MAX_ATTEMPTS;

    mockRateLimiter = {
      checkLimit: jest.fn(),
      recordAttempt: jest.fn(),
      reset: jest.fn(),
      isBlocked: jest.fn(),
    };

    mockSecurityLogger = {
      logLogin: jest.fn(),
      logLoginBlocked: jest.fn(),
      logLogout: jest.fn(),
      logTokenRefresh: jest.fn(),
      logAccessDenied: jest.fn(),
      logSuspiciousActivity: jest.fn(),
    };

    sut = new RateLimitingService({
      rateLimiter: mockRateLimiter,
      securityLogger: mockSecurityLogger,
    });
  });

  describe("validateLoginAttempt()", () => {
    describe("Success cases", () => {
      it("should allow login attempt when IP and RG limits are not exceeded", async () => {
        const mockIpLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 8,
          resetTime: new Date(Date.now() + DEFAULT_LOGIN_WINDOW_MS),
          totalAttempts: 2,
        };

        const mockRgLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 3,
          resetTime: new Date(Date.now() + DEFAULT_LOGIN_WINDOW_MS),
          totalAttempts: 2,
        };

        mockRateLimiter.checkLimit
          .mockResolvedValueOnce(mockIpLimitResult) // IP check
          .mockResolvedValueOnce(mockRgLimitResult); // RG check

        const result = await sut.validateLoginAttempt(mockIpAddress, mockRg);

        expect(result).toEqual({
          ipLimitKey: `login:ip:${mockIpAddress}`,
          rgLimitKey: `login:rg:${mockRg}`,
        });
        expect(mockRateLimiter.checkLimit).toHaveBeenCalledTimes(2);
        expect(mockSecurityLogger.logLoginBlocked).not.toHaveBeenCalled();
      });

      it("should check IP limit first with correct parameters", async () => {
        const mockIpLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 9,
          resetTime: new Date(Date.now() + DEFAULT_LOGIN_WINDOW_MS),
          totalAttempts: 1,
        };

        const mockRgLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 4,
          resetTime: new Date(Date.now() + DEFAULT_LOGIN_WINDOW_MS),
          totalAttempts: 1,
        };

        mockRateLimiter.checkLimit
          .mockResolvedValueOnce(mockIpLimitResult)
          .mockResolvedValueOnce(mockRgLimitResult);

        await sut.validateLoginAttempt(mockIpAddress, mockRg);

        expect(mockRateLimiter.checkLimit).toHaveBeenNthCalledWith(
          1,
          `login:ip:${mockIpAddress}`,
          DEFAULT_LOGIN_IP_MAX_ATTEMPTS,
          DEFAULT_LOGIN_WINDOW_MS,
        );
      });

      it("should check RG limit after IP limit passes", async () => {
        const mockIpLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 9,
          resetTime: new Date(Date.now() + DEFAULT_LOGIN_WINDOW_MS),
          totalAttempts: 1,
        };

        const mockRgLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 4,
          resetTime: new Date(Date.now() + DEFAULT_LOGIN_WINDOW_MS),
          totalAttempts: 1,
        };

        mockRateLimiter.checkLimit
          .mockResolvedValueOnce(mockIpLimitResult)
          .mockResolvedValueOnce(mockRgLimitResult);

        await sut.validateLoginAttempt(mockIpAddress, mockRg);

        expect(mockRateLimiter.checkLimit).toHaveBeenNthCalledWith(
          2,
          `login:rg:${mockRg}`,
          DEFAULT_LOGIN_USER_MAX_ATTEMPTS,
          DEFAULT_LOGIN_WINDOW_MS,
        );
      });

      it("should use default IP max attempts when env var is not set", async () => {
        delete process.env.RATE_LIMIT_LOGIN_IP_MAX_ATTEMPTS;

        const mockIpLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 9,
          resetTime: new Date(),
          totalAttempts: 1,
        };

        const mockRgLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 4,
          resetTime: new Date(),
          totalAttempts: 1,
        };

        mockRateLimiter.checkLimit
          .mockResolvedValueOnce(mockIpLimitResult)
          .mockResolvedValueOnce(mockRgLimitResult);

        await sut.validateLoginAttempt(mockIpAddress, mockRg);

        expect(mockRateLimiter.checkLimit).toHaveBeenNthCalledWith(
          1,
          expect.any(String),
          DEFAULT_LOGIN_IP_MAX_ATTEMPTS,
          expect.any(Number),
        );
      });

      it("should use default user max attempts when env var is not set", async () => {
        delete process.env.RATE_LIMIT_LOGIN_USER_MAX_ATTEMPTS;

        const mockIpLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 9,
          resetTime: new Date(),
          totalAttempts: 1,
        };

        const mockRgLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 4,
          resetTime: new Date(),
          totalAttempts: 1,
        };

        mockRateLimiter.checkLimit
          .mockResolvedValueOnce(mockIpLimitResult)
          .mockResolvedValueOnce(mockRgLimitResult);

        await sut.validateLoginAttempt(mockIpAddress, mockRg);

        expect(mockRateLimiter.checkLimit).toHaveBeenNthCalledWith(
          2,
          expect.any(String),
          DEFAULT_LOGIN_USER_MAX_ATTEMPTS,
          expect.any(Number),
        );
      });

      it("should use environment variable for IP max attempts when set", async () => {
        process.env.RATE_LIMIT_LOGIN_IP_MAX_ATTEMPTS = "15";

        const mockIpLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 14,
          resetTime: new Date(),
          totalAttempts: 1,
        };

        const mockRgLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 4,
          resetTime: new Date(),
          totalAttempts: 1,
        };

        mockRateLimiter.checkLimit
          .mockResolvedValueOnce(mockIpLimitResult)
          .mockResolvedValueOnce(mockRgLimitResult);

        await sut.validateLoginAttempt(mockIpAddress, mockRg);

        expect(mockRateLimiter.checkLimit).toHaveBeenNthCalledWith(
          1,
          expect.any(String),
          15,
          expect.any(Number),
        );
      });

      it("should use environment variable for user max attempts when set", async () => {
        process.env.RATE_LIMIT_LOGIN_USER_MAX_ATTEMPTS = "8";

        const mockIpLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 9,
          resetTime: new Date(),
          totalAttempts: 1,
        };

        const mockRgLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 7,
          resetTime: new Date(),
          totalAttempts: 1,
        };

        mockRateLimiter.checkLimit
          .mockResolvedValueOnce(mockIpLimitResult)
          .mockResolvedValueOnce(mockRgLimitResult);

        await sut.validateLoginAttempt(mockIpAddress, mockRg);

        expect(mockRateLimiter.checkLimit).toHaveBeenNthCalledWith(
          2,
          expect.any(String),
          8,
          expect.any(Number),
        );
      });
    });

    describe("IP rate limit exceeded", () => {
      it("should throw TooManyRequestsError when IP limit is exceeded", async () => {
        const resetTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const mockIpLimitResult: RateLimiterResult = {
          allowed: false,
          remainingAttempts: 0,
          resetTime,
          totalAttempts: DEFAULT_LOGIN_IP_MAX_ATTEMPTS,
        };

        mockRateLimiter.checkLimit.mockResolvedValueOnce(mockIpLimitResult);

        await expect(
          sut.validateLoginAttempt(mockIpAddress, mockRg),
        ).rejects.toThrow(TooManyRequestsError);
      });

      it("should log login blocked event when IP limit is exceeded", async () => {
        const resetTime = new Date(Date.now() + 10 * 60 * 1000);
        const mockIpLimitResult: RateLimiterResult = {
          allowed: false,
          remainingAttempts: 0,
          resetTime,
          totalAttempts: DEFAULT_LOGIN_IP_MAX_ATTEMPTS,
        };

        mockRateLimiter.checkLimit.mockResolvedValueOnce(mockIpLimitResult);

        await expect(
          sut.validateLoginAttempt(mockIpAddress, mockRg),
        ).rejects.toThrow();

        expect(mockSecurityLogger.logLoginBlocked).toHaveBeenCalledWith(
          mockIpAddress,
          undefined,
          "Rate limit por IP excedido",
        );
      });

      it("should include minutes to wait in error message for IP limit", async () => {
        const resetTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        const mockIpLimitResult: RateLimiterResult = {
          allowed: false,
          remainingAttempts: 0,
          resetTime,
          totalAttempts: DEFAULT_LOGIN_IP_MAX_ATTEMPTS,
        };

        mockRateLimiter.checkLimit.mockResolvedValueOnce(mockIpLimitResult);

        await expect(
          sut.validateLoginAttempt(mockIpAddress, mockRg),
        ).rejects.toThrow(/15 minutos/);
      });

      it("should not check RG limit if IP limit is exceeded", async () => {
        const resetTime = new Date(Date.now() + 10 * 60 * 1000);
        const mockIpLimitResult: RateLimiterResult = {
          allowed: false,
          remainingAttempts: 0,
          resetTime,
          totalAttempts: DEFAULT_LOGIN_IP_MAX_ATTEMPTS,
        };

        mockRateLimiter.checkLimit.mockResolvedValueOnce(mockIpLimitResult);

        await expect(
          sut.validateLoginAttempt(mockIpAddress, mockRg),
        ).rejects.toThrow();

        expect(mockRateLimiter.checkLimit).toHaveBeenCalledTimes(1);
      });

      it("should calculate correct minutes remaining for short duration", async () => {
        const resetTime = new Date(Date.now() + 30 * 1000); // 30 seconds
        const mockIpLimitResult: RateLimiterResult = {
          allowed: false,
          remainingAttempts: 0,
          resetTime,
          totalAttempts: DEFAULT_LOGIN_IP_MAX_ATTEMPTS,
        };

        mockRateLimiter.checkLimit.mockResolvedValueOnce(mockIpLimitResult);

        await expect(
          sut.validateLoginAttempt(mockIpAddress, mockRg),
        ).rejects.toThrow(/1 minutos/); // Math.ceil(0.5) = 1
      });
    });

    describe("RG rate limit exceeded", () => {
      it("should throw TooManyRequestsError when RG limit is exceeded", async () => {
        const mockIpLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 9,
          resetTime: new Date(),
          totalAttempts: 1,
        };

        const resetTime = new Date(Date.now() + 10 * 60 * 1000);
        const mockRgLimitResult: RateLimiterResult = {
          allowed: false,
          remainingAttempts: 0,
          resetTime,
          totalAttempts: DEFAULT_LOGIN_USER_MAX_ATTEMPTS,
        };

        mockRateLimiter.checkLimit
          .mockResolvedValueOnce(mockIpLimitResult)
          .mockResolvedValueOnce(mockRgLimitResult);

        await expect(
          sut.validateLoginAttempt(mockIpAddress, mockRg),
        ).rejects.toThrow(TooManyRequestsError);
      });

      it("should log login blocked event when RG limit is exceeded", async () => {
        const mockIpLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 9,
          resetTime: new Date(),
          totalAttempts: 1,
        };

        const resetTime = new Date(Date.now() + 10 * 60 * 1000);
        const mockRgLimitResult: RateLimiterResult = {
          allowed: false,
          remainingAttempts: 0,
          resetTime,
          totalAttempts: DEFAULT_LOGIN_USER_MAX_ATTEMPTS,
        };

        mockRateLimiter.checkLimit
          .mockResolvedValueOnce(mockIpLimitResult)
          .mockResolvedValueOnce(mockRgLimitResult);

        await expect(
          sut.validateLoginAttempt(mockIpAddress, mockRg),
        ).rejects.toThrow();

        expect(mockSecurityLogger.logLoginBlocked).toHaveBeenCalledWith(
          `RG:${mockRg}`,
          undefined,
          "Rate limit por usuário excedido",
        );
      });

      it("should include minutes to wait in error message for RG limit", async () => {
        const mockIpLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 9,
          resetTime: new Date(),
          totalAttempts: 1,
        };

        const resetTime = new Date(Date.now() + 12 * 60 * 1000); // 12 minutes
        const mockRgLimitResult: RateLimiterResult = {
          allowed: false,
          remainingAttempts: 0,
          resetTime,
          totalAttempts: DEFAULT_LOGIN_USER_MAX_ATTEMPTS,
        };

        mockRateLimiter.checkLimit
          .mockResolvedValueOnce(mockIpLimitResult)
          .mockResolvedValueOnce(mockRgLimitResult);

        await expect(
          sut.validateLoginAttempt(mockIpAddress, mockRg),
        ).rejects.toThrow(/12 minutos/);
      });

      it("should mention user in error message for RG limit", async () => {
        const mockIpLimitResult: RateLimiterResult = {
          allowed: true,
          remainingAttempts: 9,
          resetTime: new Date(),
          totalAttempts: 1,
        };

        const resetTime = new Date(Date.now() + 10 * 60 * 1000);
        const mockRgLimitResult: RateLimiterResult = {
          allowed: false,
          remainingAttempts: 0,
          resetTime,
          totalAttempts: DEFAULT_LOGIN_USER_MAX_ATTEMPTS,
        };

        mockRateLimiter.checkLimit
          .mockResolvedValueOnce(mockIpLimitResult)
          .mockResolvedValueOnce(mockRgLimitResult);

        await expect(
          sut.validateLoginAttempt(mockIpAddress, mockRg),
        ).rejects.toThrow(/este usuário/);
      });
    });
  });

  describe("recordFailedAttempt()", () => {
    it("should record attempt for IP key", async () => {
      const keys = {
        ipLimitKey: `login:ip:${mockIpAddress}`,
        rgLimitKey: `login:rg:${mockRg}`,
      };

      await sut.recordFailedAttempt(keys);

      expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith(
        keys.ipLimitKey,
        DEFAULT_LOGIN_WINDOW_MS,
      );
    });

    it("should record attempt for RG key", async () => {
      const keys = {
        ipLimitKey: `login:ip:${mockIpAddress}`,
        rgLimitKey: `login:rg:${mockRg}`,
      };

      await sut.recordFailedAttempt(keys);

      expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith(
        keys.rgLimitKey,
        DEFAULT_LOGIN_WINDOW_MS,
      );
    });

    it("should record attempts for both keys", async () => {
      const keys = {
        ipLimitKey: `login:ip:${mockIpAddress}`,
        rgLimitKey: `login:rg:${mockRg}`,
      };

      await sut.recordFailedAttempt(keys);

      expect(mockRateLimiter.recordAttempt).toHaveBeenCalledTimes(2);
    });

    it("should use correct window duration for both attempts", async () => {
      const keys = {
        ipLimitKey: `login:ip:${mockIpAddress}`,
        rgLimitKey: `login:rg:${mockRg}`,
      };

      await sut.recordFailedAttempt(keys);

      expect(mockRateLimiter.recordAttempt).toHaveBeenNthCalledWith(
        1,
        expect.any(String),
        DEFAULT_LOGIN_WINDOW_MS,
      );
      expect(mockRateLimiter.recordAttempt).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        DEFAULT_LOGIN_WINDOW_MS,
      );
    });
  });

  describe("resetLimits()", () => {
    it("should reset IP limit", async () => {
      const keys = {
        ipLimitKey: `login:ip:${mockIpAddress}`,
        rgLimitKey: `login:rg:${mockRg}`,
      };

      await sut.resetLimits(keys);

      expect(mockRateLimiter.reset).toHaveBeenCalledWith(keys.ipLimitKey);
    });

    it("should reset RG limit", async () => {
      const keys = {
        ipLimitKey: `login:ip:${mockIpAddress}`,
        rgLimitKey: `login:rg:${mockRg}`,
      };

      await sut.resetLimits(keys);

      expect(mockRateLimiter.reset).toHaveBeenCalledWith(keys.rgLimitKey);
    });

    it("should reset both limits", async () => {
      const keys = {
        ipLimitKey: `login:ip:${mockIpAddress}`,
        rgLimitKey: `login:rg:${mockRg}`,
      };

      await sut.resetLimits(keys);

      expect(mockRateLimiter.reset).toHaveBeenCalledTimes(2);
    });

    it("should reset limits in correct order (IP first, then RG)", async () => {
      const keys = {
        ipLimitKey: `login:ip:${mockIpAddress}`,
        rgLimitKey: `login:rg:${mockRg}`,
      };

      await sut.resetLimits(keys);

      expect(mockRateLimiter.reset).toHaveBeenNthCalledWith(1, keys.ipLimitKey);
      expect(mockRateLimiter.reset).toHaveBeenNthCalledWith(2, keys.rgLimitKey);
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complete failed login flow", async () => {
      // 1. Validate attempt (passes)
      const mockIpLimitResult: RateLimiterResult = {
        allowed: true,
        remainingAttempts: 8,
        resetTime: new Date(),
        totalAttempts: 2,
      };

      const mockRgLimitResult: RateLimiterResult = {
        allowed: true,
        remainingAttempts: 3,
        resetTime: new Date(),
        totalAttempts: 2,
      };

      mockRateLimiter.checkLimit
        .mockResolvedValueOnce(mockIpLimitResult)
        .mockResolvedValueOnce(mockRgLimitResult);

      const keys = await sut.validateLoginAttempt(mockIpAddress, mockRg);

      // 2. Record failed attempt
      await sut.recordFailedAttempt(keys);

      expect(mockRateLimiter.checkLimit).toHaveBeenCalledTimes(2);
      expect(mockRateLimiter.recordAttempt).toHaveBeenCalledTimes(2);
    });

    it("should handle complete successful login flow", async () => {
      // 1. Validate attempt (passes)
      const mockIpLimitResult: RateLimiterResult = {
        allowed: true,
        remainingAttempts: 8,
        resetTime: new Date(),
        totalAttempts: 2,
      };

      const mockRgLimitResult: RateLimiterResult = {
        allowed: true,
        remainingAttempts: 3,
        resetTime: new Date(),
        totalAttempts: 2,
      };

      mockRateLimiter.checkLimit
        .mockResolvedValueOnce(mockIpLimitResult)
        .mockResolvedValueOnce(mockRgLimitResult);

      const keys = await sut.validateLoginAttempt(mockIpAddress, mockRg);

      // 2. Reset limits after success
      await sut.resetLimits(keys);

      expect(mockRateLimiter.checkLimit).toHaveBeenCalledTimes(2);
      expect(mockRateLimiter.reset).toHaveBeenCalledTimes(2);
    });

    it("should prevent any action after IP limit is exceeded", async () => {
      const resetTime = new Date(Date.now() + 15 * 60 * 1000);
      const mockIpLimitResult: RateLimiterResult = {
        allowed: false,
        remainingAttempts: 0,
        resetTime,
        totalAttempts: DEFAULT_LOGIN_IP_MAX_ATTEMPTS,
      };

      mockRateLimiter.checkLimit.mockResolvedValueOnce(mockIpLimitResult);

      await expect(
        sut.validateLoginAttempt(mockIpAddress, mockRg),
      ).rejects.toThrow();

      // Should not proceed to record or reset
      expect(mockRateLimiter.recordAttempt).not.toHaveBeenCalled();
      expect(mockRateLimiter.reset).not.toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("should handle different IP addresses independently", async () => {
      const ip1 = "192.168.1.1";
      const ip2 = "192.168.1.2";

      const mockLimitResult: RateLimiterResult = {
        allowed: true,
        remainingAttempts: 9,
        resetTime: new Date(),
        totalAttempts: 1,
      };

      mockRateLimiter.checkLimit.mockResolvedValue(mockLimitResult);

      const keys1 = await sut.validateLoginAttempt(ip1, mockRg);
      const keys2 = await sut.validateLoginAttempt(ip2, mockRg);

      expect(keys1.ipLimitKey).not.toBe(keys2.ipLimitKey);
      expect(keys1.ipLimitKey).toBe(`login:ip:${ip1}`);
      expect(keys2.ipLimitKey).toBe(`login:ip:${ip2}`);
    });

    it("should handle different RGs independently", async () => {
      const rg1 = 123456789;
      const rg2 = 987654321;

      const mockLimitResult: RateLimiterResult = {
        allowed: true,
        remainingAttempts: 9,
        resetTime: new Date(),
        totalAttempts: 1,
      };

      mockRateLimiter.checkLimit.mockResolvedValue(mockLimitResult);

      const keys1 = await sut.validateLoginAttempt(mockIpAddress, rg1);
      const keys2 = await sut.validateLoginAttempt(mockIpAddress, rg2);

      expect(keys1.rgLimitKey).not.toBe(keys2.rgLimitKey);
      expect(keys1.rgLimitKey).toBe(`login:rg:${rg1}`);
      expect(keys2.rgLimitKey).toBe(`login:rg:${rg2}`);
    });

    it("should handle zero remaining attempts correctly", async () => {
      const resetTime = new Date(Date.now() + 10 * 60 * 1000);
      const mockIpLimitResult: RateLimiterResult = {
        allowed: false,
        remainingAttempts: 0,
        resetTime,
        totalAttempts: DEFAULT_LOGIN_IP_MAX_ATTEMPTS,
      };

      mockRateLimiter.checkLimit.mockResolvedValueOnce(mockIpLimitResult);

      await expect(
        sut.validateLoginAttempt(mockIpAddress, mockRg),
      ).rejects.toThrow(TooManyRequestsError);
    });

    it("should handle IPv6 addresses", async () => {
      const ipv6 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";

      const mockLimitResult: RateLimiterResult = {
        allowed: true,
        remainingAttempts: 9,
        resetTime: new Date(),
        totalAttempts: 1,
      };

      mockRateLimiter.checkLimit.mockResolvedValue(mockLimitResult);

      const keys = await sut.validateLoginAttempt(ipv6, mockRg);

      expect(keys.ipLimitKey).toBe(`login:ip:${ipv6}`);
    });

    it("should handle very large RG numbers", async () => {
      const largeRg = 999999999999;

      const mockLimitResult: RateLimiterResult = {
        allowed: true,
        remainingAttempts: 9,
        resetTime: new Date(),
        totalAttempts: 1,
      };

      mockRateLimiter.checkLimit.mockResolvedValue(mockLimitResult);

      const keys = await sut.validateLoginAttempt(mockIpAddress, largeRg);

      expect(keys.rgLimitKey).toBe(`login:rg:${largeRg}`);
    });
  });
});
