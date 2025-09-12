import { InMemoryRateLimiterAdapter } from "../../../../src/infra/adapters";

describe("InMemoryRateLimiterAdapter", () => {
  let rateLimiter: InMemoryRateLimiterAdapter;

  beforeEach(() => {
    rateLimiter = new InMemoryRateLimiterAdapter();
  });

  describe("checkLimit", () => {
    it("should allow first attempt within limit", async () => {
      const result = await rateLimiter.checkLimit("test-key", 3, 60000);

      expect(result).toEqual({
        allowed: true,
        remainingAttempts: 3,
        resetTime: expect.any(Date),
        totalAttempts: 0,
      });
    });

    it("should track attempts correctly", async () => {
      await rateLimiter.recordAttempt("test-key", 60000);

      const result = await rateLimiter.checkLimit("test-key", 3, 60000);

      expect(result).toEqual({
        allowed: true,
        remainingAttempts: 2,
        resetTime: expect.any(Date),
        totalAttempts: 1,
      });
    });

    it("should block when limit is exceeded", async () => {
      // Record 3 attempts
      await rateLimiter.recordAttempt("test-key", 60000);
      await rateLimiter.recordAttempt("test-key", 60000);
      await rateLimiter.recordAttempt("test-key", 60000);

      const result = await rateLimiter.checkLimit("test-key", 3, 60000);

      expect(result).toEqual({
        allowed: false,
        remainingAttempts: 0,
        resetTime: expect.any(Date),
        totalAttempts: 3,
      });

      // Check that reset time is in the future (blocked for 15 minutes)
      const now = new Date();
      const expectedBlockTime = new Date(now.getTime() + 15 * 60 * 1000);
      expect(result.resetTime.getTime()).toBeGreaterThanOrEqual(now.getTime());
      expect(result.resetTime.getTime()).toBeLessThanOrEqual(
        expectedBlockTime.getTime() + 1000,
      ); // 1s tolerance
    });

    it("should return blocked status when key is blocked", async () => {
      // Record enough attempts to trigger block
      await rateLimiter.recordAttempt("test-key", 60000);
      await rateLimiter.recordAttempt("test-key", 60000);
      await rateLimiter.recordAttempt("test-key", 60000);

      // First check triggers the block
      await rateLimiter.checkLimit("test-key", 3, 60000);

      // Second check should show blocked
      const result = await rateLimiter.checkLimit("test-key", 3, 60000);

      expect(result).toEqual({
        allowed: false,
        remainingAttempts: 0,
        resetTime: expect.any(Date),
        totalAttempts: 3,
      });
    });

    it("should clean expired attempts from window", async () => {
      const windowMs = 1000; // 1 second window

      // Record attempt
      await rateLimiter.recordAttempt("test-key", windowMs);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const result = await rateLimiter.checkLimit("test-key", 3, windowMs);

      expect(result).toEqual({
        allowed: true,
        remainingAttempts: 3,
        resetTime: expect.any(Date),
        totalAttempts: 0,
      });
    });

    it("should handle different keys independently", async () => {
      await rateLimiter.recordAttempt("key1", 60000);
      await rateLimiter.recordAttempt("key1", 60000);

      await rateLimiter.recordAttempt("key2", 60000);

      const result1 = await rateLimiter.checkLimit("key1", 3, 60000);
      const result2 = await rateLimiter.checkLimit("key2", 3, 60000);

      expect(result1.totalAttempts).toBe(2);
      expect(result1.remainingAttempts).toBe(1);
      expect(result2.totalAttempts).toBe(1);
      expect(result2.remainingAttempts).toBe(2);
    });
  });

  describe("recordAttempt", () => {
    it("should record attempt for new key", async () => {
      await rateLimiter.recordAttempt("test-key", 60000);

      const result = await rateLimiter.checkLimit("test-key", 3, 60000);
      expect(result.totalAttempts).toBe(1);
    });

    it("should record multiple attempts", async () => {
      await rateLimiter.recordAttempt("test-key", 60000);
      await rateLimiter.recordAttempt("test-key", 60000);

      const result = await rateLimiter.checkLimit("test-key", 3, 60000);
      expect(result.totalAttempts).toBe(2);
    });

    it("should clean old attempts when recording new one", async () => {
      const windowMs = 1000; // 1 second window

      // Record first attempt
      await rateLimiter.recordAttempt("test-key", windowMs);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Record new attempt (should clean the old one)
      await rateLimiter.recordAttempt("test-key", windowMs);

      const result = await rateLimiter.checkLimit("test-key", 3, windowMs);
      expect(result.totalAttempts).toBe(1);
    });
  });

  describe("reset", () => {
    it("should reset attempts for specific key", async () => {
      await rateLimiter.recordAttempt("test-key", 60000);
      await rateLimiter.recordAttempt("test-key", 60000);

      await rateLimiter.reset("test-key");

      const result = await rateLimiter.checkLimit("test-key", 3, 60000);
      expect(result.totalAttempts).toBe(0);
      expect(result.remainingAttempts).toBe(3);
    });

    it("should not affect other keys", async () => {
      await rateLimiter.recordAttempt("key1", 60000);
      await rateLimiter.recordAttempt("key2", 60000);

      await rateLimiter.reset("key1");

      const result1 = await rateLimiter.checkLimit("key1", 3, 60000);
      const result2 = await rateLimiter.checkLimit("key2", 3, 60000);

      expect(result1.totalAttempts).toBe(0);
      expect(result2.totalAttempts).toBe(1);
    });

    it("should handle reset of non-existent key", async () => {
      await expect(rateLimiter.reset("non-existent")).resolves.not.toThrow();
    });
  });

  describe("isBlocked", () => {
    it("should return false for non-existent key", async () => {
      const result = await rateLimiter.isBlocked("non-existent");
      expect(result).toBe(false);
    });

    it("should return false for key without block", async () => {
      await rateLimiter.recordAttempt("test-key", 60000);

      const result = await rateLimiter.isBlocked("test-key");
      expect(result).toBe(false);
    });

    it("should return true when key is blocked", async () => {
      // Trigger block by exceeding limit
      await rateLimiter.recordAttempt("test-key", 60000);
      await rateLimiter.recordAttempt("test-key", 60000);
      await rateLimiter.recordAttempt("test-key", 60000);

      // This should trigger the block
      await rateLimiter.checkLimit("test-key", 3, 60000);

      const result = await rateLimiter.isBlocked("test-key");
      expect(result).toBe(true);
    });

    it("should return false when block has expired", async () => {
      // Mock Date to control time
      const originalDate = Date;
      const mockNow = new Date("2023-01-01T00:00:00Z");

      global.Date = class extends Date {
        constructor(...args: unknown[]) {
          if (args.length === 0) {
            super(mockNow);
          } else {
            super(...(args as []));
          }
        }
        static now() {
          return mockNow.getTime();
        }
      } as DateConstructor;

      // Trigger block
      await rateLimiter.recordAttempt("test-key", 60000);
      await rateLimiter.recordAttempt("test-key", 60000);
      await rateLimiter.recordAttempt("test-key", 60000);
      await rateLimiter.checkLimit("test-key", 3, 60000);

      // Should be blocked initially
      expect(await rateLimiter.isBlocked("test-key")).toBe(true);

      // Fast forward time beyond block duration
      const futureTime = new Date(mockNow.getTime() + 16 * 60 * 1000); // 16 minutes later
      global.Date = class extends Date {
        constructor(...args: unknown[]) {
          if (args.length === 0) {
            super(futureTime);
          } else {
            super(...(args as []));
          }
        }
        static now() {
          return futureTime.getTime();
        }
      } as DateConstructor;

      // Should not be blocked anymore
      expect(await rateLimiter.isBlocked("test-key")).toBe(false);

      // Restore original Date
      global.Date = originalDate;
    });
  });

  describe("cleanup", () => {
    it("should remove old records without recent attempts", async () => {
      // Mock Date to control time
      const originalDate = Date;
      const mockNow = new Date("2023-01-01T00:00:00Z");

      global.Date = class extends Date {
        constructor(...args: unknown[]) {
          if (args.length === 0) {
            super(mockNow);
          } else {
            super(...(args as []));
          }
        }
        static now() {
          return mockNow.getTime();
        }
      } as DateConstructor;

      // Record old attempt
      await rateLimiter.recordAttempt("old-key", 60000);

      // Fast forward time beyond cleanup threshold (1 hour)
      const futureTime = new Date(mockNow.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      global.Date = class extends Date {
        constructor(...args: unknown[]) {
          if (args.length === 0) {
            super(futureTime);
          } else {
            super(...(args as []));
          }
        }
        static now() {
          return futureTime.getTime();
        }
      } as DateConstructor;

      // Run cleanup
      await rateLimiter.cleanup();

      // Check should show no attempts (record was cleaned)
      const result = await rateLimiter.checkLimit("old-key", 3, 60000);
      expect(result.totalAttempts).toBe(0);

      // Restore original Date
      global.Date = originalDate;
    });

    it("should keep recent records", async () => {
      await rateLimiter.recordAttempt("recent-key", 60000);

      await rateLimiter.cleanup();

      const result = await rateLimiter.checkLimit("recent-key", 3, 60000);
      expect(result.totalAttempts).toBe(1);
    });

    it("should keep blocked records even if old", async () => {
      // Mock Date to control time
      const originalDate = Date;
      const mockNow = new Date("2023-01-01T00:00:00Z");

      global.Date = class extends Date {
        constructor(...args: unknown[]) {
          if (args.length === 0) {
            super(mockNow);
          } else {
            super(...(args as []));
          }
        }
        static now() {
          return mockNow.getTime();
        }
      } as DateConstructor;

      // Create blocked record with old attempts
      await rateLimiter.recordAttempt("blocked-key", 60000);
      await rateLimiter.recordAttempt("blocked-key", 60000);
      await rateLimiter.recordAttempt("blocked-key", 60000);
      await rateLimiter.checkLimit("blocked-key", 3, 60000); // This blocks the key

      // Fast forward time beyond cleanup threshold (2 hours) but keep block active by updating mock
      const futureTime = new Date(mockNow.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      const blockTime = new Date(futureTime.getTime() + 15 * 60 * 1000); // Block extends 15 minutes from future time

      global.Date = class extends Date {
        constructor(...args: unknown[]) {
          if (args.length === 0) {
            super(futureTime);
          } else {
            super(...(args as []));
          }
        }
        static now() {
          return futureTime.getTime();
        }
      } as DateConstructor;

      // Manually set a future block time to simulate the condition
      const record = (rateLimiter as any).records.get("blocked-key");
      if (record) {
        record.blockedUntil = blockTime;
      }

      // Run cleanup
      await rateLimiter.cleanup();

      // Should still be blocked (record not cleaned because it's blocked)
      expect(await rateLimiter.isBlocked("blocked-key")).toBe(true);

      // Restore original Date
      global.Date = originalDate;
    });
  });

  describe("edge cases", () => {
    it("should handle zero max attempts", async () => {
      const result = await rateLimiter.checkLimit("test-key", 0, 60000);

      expect(result).toEqual({
        allowed: false,
        remainingAttempts: 0,
        resetTime: expect.any(Date),
        totalAttempts: 0,
      });
    });

    it("should handle negative max attempts", async () => {
      const result = await rateLimiter.checkLimit("test-key", -1, 60000);

      expect(result).toEqual({
        allowed: false,
        remainingAttempts: 0,
        resetTime: expect.any(Date),
        totalAttempts: 0,
      });
    });

    it("should handle very large window", async () => {
      const largeWindow = 365 * 24 * 60 * 60 * 1000; // 1 year

      await rateLimiter.recordAttempt("test-key", largeWindow);
      const result = await rateLimiter.checkLimit("test-key", 3, largeWindow);

      expect(result.totalAttempts).toBe(1);
      expect(result.remainingAttempts).toBe(2);
    });

    it("should handle empty key string", async () => {
      await rateLimiter.recordAttempt("", 60000);
      const result = await rateLimiter.checkLimit("", 3, 60000);

      expect(result.totalAttempts).toBe(1);
      expect(result.remainingAttempts).toBe(2);
    });
  });
});
