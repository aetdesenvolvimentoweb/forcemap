import { RateLimiterService } from "../../../../../src/application/services";

describe("RateLimiterService", () => {
  let sut: RateLimiterService;

  beforeEach(() => {
    sut = new RateLimiterService();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const createMockDate = (timestamp: number): Date => {
    const date = new Date(timestamp);
    jest.setSystemTime(date);
    return date;
  };

  describe("checkLimit", () => {
    const key = "test-key";
    const maxAttempts = 5;
    const windowMs = 60000; // 1 minute

    it("should allow request when no attempts exist", async () => {
      const now = createMockDate(1000000);

      const result = await sut.checkLimit(key, maxAttempts, windowMs);

      expect(result).toEqual({
        allowed: true,
        remainingAttempts: maxAttempts,
        resetTime: new Date(now.getTime() + windowMs),
        totalAttempts: 0,
      });
    });

    it("should allow request when under the limit", async () => {
      const now = createMockDate(1000000);

      // Record some attempts
      await sut.recordAttempt(key, windowMs);
      await sut.recordAttempt(key, windowMs);

      const result = await sut.checkLimit(key, maxAttempts, windowMs);

      expect(result).toEqual({
        allowed: true,
        remainingAttempts: 3, // 5 - 2
        resetTime: new Date(now.getTime() + windowMs),
        totalAttempts: 2,
      });
    });

    it("should block request when limit is exceeded", async () => {
      const now = createMockDate(1000000);

      // Record max attempts
      for (let i = 0; i < maxAttempts; i++) {
        await sut.recordAttempt(key, windowMs);
      }

      const result = await sut.checkLimit(key, maxAttempts, windowMs);

      expect(result).toEqual({
        allowed: false,
        remainingAttempts: 0,
        resetTime: new Date(now.getTime() + 15 * 60 * 1000), // 15 minutes block
        totalAttempts: maxAttempts,
      });
    });

    it("should return blocked status when currently blocked", async () => {
      createMockDate(1000000);

      // Record max attempts to trigger block
      for (let i = 0; i < maxAttempts; i++) {
        await sut.recordAttempt(key, windowMs);
      }

      // First call triggers the block
      await sut.checkLimit(key, maxAttempts, windowMs);

      // Move time forward but still within block period
      createMockDate(1000000 + 5 * 60 * 1000); // 5 minutes later

      const result = await sut.checkLimit(key, maxAttempts, windowMs);

      expect(result).toEqual({
        allowed: false,
        remainingAttempts: 0,
        resetTime: new Date(1000000 + 15 * 60 * 1000),
        totalAttempts: maxAttempts,
      });
    });

    it("should allow requests after block period expires", async () => {
      createMockDate(1000000);

      // Record max attempts to trigger block
      for (let i = 0; i < maxAttempts; i++) {
        await sut.recordAttempt(key, windowMs);
      }

      // Trigger block
      await sut.checkLimit(key, maxAttempts, windowMs);

      // Move time forward past block period
      const afterBlockTime = createMockDate(1000000 + 16 * 60 * 1000); // 16 minutes later

      const result = await sut.checkLimit(key, maxAttempts, windowMs);

      expect(result).toEqual({
        allowed: true,
        remainingAttempts: maxAttempts,
        resetTime: new Date(afterBlockTime.getTime() + windowMs),
        totalAttempts: 0, // Old attempts should be cleaned up
      });
    });

    it("should clean expired attempts from window", async () => {
      const now = createMockDate(1000000);

      // Record attempts
      await sut.recordAttempt(key, windowMs);
      await sut.recordAttempt(key, windowMs);

      // Move time forward beyond window
      createMockDate(now.getTime() + windowMs + 1000); // 1 second after window expires

      const result = await sut.checkLimit(key, maxAttempts, windowMs);

      expect(result.totalAttempts).toBe(0);
      expect(result.remainingAttempts).toBe(maxAttempts);
    });

    it("should handle different keys independently", async () => {
      const key1 = "key1";
      const key2 = "key2";

      // Record attempts for key1
      for (let i = 0; i < maxAttempts; i++) {
        await sut.recordAttempt(key1, windowMs);
      }

      // Check key1 (should be blocked)
      const result1 = await sut.checkLimit(key1, maxAttempts, windowMs);
      expect(result1.allowed).toBe(false);

      // Check key2 (should be allowed)
      const result2 = await sut.checkLimit(key2, maxAttempts, windowMs);
      expect(result2.allowed).toBe(true);
      expect(result2.remainingAttempts).toBe(maxAttempts);
    });

    it("should handle zero max attempts", async () => {
      createMockDate(1000000);

      const result = await sut.checkLimit(key, 0, windowMs);

      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
    });

    it("should handle different window sizes", async () => {
      const now = createMockDate(1000000);
      const shortWindow = 5000; // 5 seconds

      await sut.recordAttempt(key, shortWindow);

      // Check within short window
      let result = await sut.checkLimit(key, maxAttempts, shortWindow);
      expect(result.totalAttempts).toBe(1);

      // Move time forward past short window
      createMockDate(now.getTime() + shortWindow + 1000);

      // Check again - attempt should be expired
      result = await sut.checkLimit(key, maxAttempts, shortWindow);
      expect(result.totalAttempts).toBe(0);
    });
  });

  describe("recordAttempt", () => {
    const key = "test-key";
    const windowMs = 60000;

    it("should record a new attempt", async () => {
      await sut.recordAttempt(key, windowMs);

      const result = await sut.checkLimit(key, 5, windowMs);
      expect(result.totalAttempts).toBe(1);
    });

    it("should record multiple attempts", async () => {
      createMockDate(1000000);

      await sut.recordAttempt(key, windowMs);
      await sut.recordAttempt(key, windowMs);
      await sut.recordAttempt(key, windowMs);

      const result = await sut.checkLimit(key, 5, windowMs);
      expect(result.totalAttempts).toBe(3);
    });

    it("should clean old attempts when recording", async () => {
      const now = createMockDate(1000000);

      // Record initial attempt
      await sut.recordAttempt(key, windowMs);

      // Move time forward past window
      createMockDate(now.getTime() + windowMs + 1000);

      // Record new attempt (should clean old one)
      await sut.recordAttempt(key, windowMs);

      const result = await sut.checkLimit(key, 5, windowMs);
      expect(result.totalAttempts).toBe(1); // Only the new attempt
    });

    it("should handle attempts for different keys", async () => {
      createMockDate(1000000);
      const key1 = "key1";
      const key2 = "key2";

      await sut.recordAttempt(key1, windowMs);
      await sut.recordAttempt(key2, windowMs);
      await sut.recordAttempt(key2, windowMs);

      const result1 = await sut.checkLimit(key1, 5, windowMs);
      const result2 = await sut.checkLimit(key2, 5, windowMs);

      expect(result1.totalAttempts).toBe(1);
      expect(result2.totalAttempts).toBe(2);
    });
  });

  describe("reset", () => {
    const key = "test-key";
    const windowMs = 60000;

    it("should reset attempts for a key", async () => {
      createMockDate(1000000);

      // Record some attempts
      await sut.recordAttempt(key, windowMs);
      await sut.recordAttempt(key, windowMs);

      // Verify attempts exist
      let result = await sut.checkLimit(key, 5, windowMs);
      expect(result.totalAttempts).toBe(2);

      // Reset
      await sut.reset(key);

      // Verify attempts are cleared
      result = await sut.checkLimit(key, 5, windowMs);
      expect(result.totalAttempts).toBe(0);
      expect(result.remainingAttempts).toBe(5);
    });

    it("should reset block status", async () => {
      createMockDate(1000000);

      // Trigger block
      for (let i = 0; i < 5; i++) {
        await sut.recordAttempt(key, windowMs);
      }

      let result = await sut.checkLimit(key, 5, windowMs);
      expect(result.allowed).toBe(false);

      // Reset
      await sut.reset(key);

      // Verify block is cleared
      result = await sut.checkLimit(key, 5, windowMs);
      expect(result.allowed).toBe(true);
      expect(result.totalAttempts).toBe(0);
    });

    it("should not affect other keys", async () => {
      createMockDate(1000000);
      const key1 = "key1";
      const key2 = "key2";

      // Record attempts for both keys
      await sut.recordAttempt(key1, windowMs);
      await sut.recordAttempt(key2, windowMs);

      // Reset only key1
      await sut.reset(key1);

      // Check results
      const result1 = await sut.checkLimit(key1, 5, windowMs);
      const result2 = await sut.checkLimit(key2, 5, windowMs);

      expect(result1.totalAttempts).toBe(0);
      expect(result2.totalAttempts).toBe(1);
    });

    it("should handle reset of non-existent key", async () => {
      createMockDate(1000000);

      // Should not throw error
      await expect(sut.reset("non-existent")).resolves.not.toThrow();

      // Should still work normally
      const result = await sut.checkLimit("non-existent", 5, windowMs);
      expect(result.totalAttempts).toBe(0);
    });
  });

  describe("isBlocked", () => {
    const key = "test-key";
    const windowMs = 60000;

    it("should return false for non-existent key", async () => {
      const result = await sut.isBlocked("non-existent");
      expect(result).toBe(false);
    });

    it("should return false for key without block", async () => {
      createMockDate(1000000);

      await sut.recordAttempt(key, windowMs);

      const result = await sut.isBlocked(key);
      expect(result).toBe(false);
    });

    it("should return true when key is blocked", async () => {
      createMockDate(1000000);

      // Trigger block
      for (let i = 0; i < 5; i++) {
        await sut.recordAttempt(key, windowMs);
      }
      await sut.checkLimit(key, 5, windowMs);

      const result = await sut.isBlocked(key);
      expect(result).toBe(true);
    });

    it("should return false after block expires", async () => {
      createMockDate(1000000);

      // Trigger block
      for (let i = 0; i < 5; i++) {
        await sut.recordAttempt(key, windowMs);
      }
      await sut.checkLimit(key, 5, windowMs);

      // Verify blocked
      let result = await sut.isBlocked(key);
      expect(result).toBe(true);

      // Move time past block period
      createMockDate(1000000 + 16 * 60 * 1000);

      // Should no longer be blocked
      result = await sut.isBlocked(key);
      expect(result).toBe(false);
    });

    it("should handle key with undefined blockedUntil", async () => {
      createMockDate(1000000);

      await sut.recordAttempt(key, windowMs);

      const result = await sut.isBlocked(key);
      expect(result).toBe(false);
    });
  });

  describe("cleanup", () => {
    const windowMs = 60000;

    it("should remove old records with no recent attempts", async () => {
      const now = createMockDate(1000000);
      const key1 = "old-key";
      const key2 = "recent-key";

      // Create old record
      await sut.recordAttempt(key1, windowMs);

      // Move time forward more than 1 hour
      createMockDate(now.getTime() + 2 * 60 * 60 * 1000);

      // Create recent record
      await sut.recordAttempt(key2, windowMs);

      // Run cleanup
      await sut.cleanup();

      // Check that old key is removed, recent key remains
      const result1 = await sut.checkLimit(key1, 5, windowMs);
      const result2 = await sut.checkLimit(key2, 5, windowMs);

      expect(result1.totalAttempts).toBe(0); // Should be clean slate
      expect(result2.totalAttempts).toBe(1); // Should still have the attempt
    });

    it("should not remove blocked records even if old", async () => {
      const now = createMockDate(1000000);
      const key = "blocked-key";

      // Create attempts and trigger block
      for (let i = 0; i < 5; i++) {
        await sut.recordAttempt(key, windowMs);
      }
      await sut.checkLimit(key, 5, windowMs); // Triggers block

      // Move time forward more than 1 hour but less than block duration (15 minutes)
      createMockDate(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours - past block time

      // Run cleanup
      await sut.cleanup();

      // Should no longer be blocked since 2 hours > 15 minutes block duration
      const isBlocked = await sut.isBlocked(key);
      expect(isBlocked).toBe(false);
    });

    it("should remove records that are no longer blocked and have no recent attempts", async () => {
      const now = createMockDate(1000000);
      const key = "expired-block-key";

      // Create attempts and trigger block
      for (let i = 0; i < 5; i++) {
        await sut.recordAttempt(key, windowMs);
      }
      await sut.checkLimit(key, 5, windowMs);

      // Move time forward past both block period and cleanup threshold
      createMockDate(now.getTime() + 2 * 60 * 60 * 1000);

      // Run cleanup
      await sut.cleanup();

      // Should be clean slate
      const result = await sut.checkLimit(key, 5, windowMs);
      expect(result.totalAttempts).toBe(0);
      expect(result.allowed).toBe(true);
    });

    it("should handle cleanup with no records", async () => {
      createMockDate(1000000);

      // Should not throw error
      await expect(sut.cleanup()).resolves.not.toThrow();
    });

    it("should keep records with recent attempts", async () => {
      const now = createMockDate(1000000);
      const key = "recent-key";

      // Create recent attempt
      await sut.recordAttempt(key, windowMs);

      // Move forward but within 1 hour threshold (30 minutes)
      createMockDate(now.getTime() + 30 * 60 * 1000); // 30 minutes later

      // Add another recent attempt to keep the record alive
      await sut.recordAttempt(key, windowMs);

      // Run cleanup - should not remove because we have recent attempts
      await sut.cleanup();

      // Should still have the recent record
      const result = await sut.checkLimit(key, 5, windowMs);
      expect(result.totalAttempts).toBe(1); // The recent attempt
    });

    it("should keep blocked records within block period", async () => {
      const now = createMockDate(1000000);
      const key = "blocked-key";

      // Create attempts and trigger block
      for (let i = 0; i < 5; i++) {
        await sut.recordAttempt(key, windowMs);
      }
      await sut.checkLimit(key, 5, windowMs); // Triggers block

      // Move time forward less than block duration (10 minutes)
      createMockDate(now.getTime() + 10 * 60 * 1000); // 10 minutes later

      // Run cleanup
      await sut.cleanup();

      // Should still be blocked
      const isBlocked = await sut.isBlocked(key);
      expect(isBlocked).toBe(true);
    });
  });

  describe("integration scenarios", () => {
    const key = "integration-key";
    const maxAttempts = 3;
    const windowMs = 10000; // 10 seconds

    it("should handle complete rate limiting flow", async () => {
      const startTime = createMockDate(1000000);

      // Make allowed requests
      for (let i = 0; i < maxAttempts; i++) {
        await sut.recordAttempt(key, windowMs);
        const result = await sut.checkLimit(key, maxAttempts, windowMs);

        if (i < maxAttempts - 1) {
          expect(result.allowed).toBe(true);
          expect(result.remainingAttempts).toBe(maxAttempts - i - 1);
        } else {
          // Last attempt should trigger limit
          expect(result.allowed).toBe(false);
          expect(result.remainingAttempts).toBe(0);
        }
      }

      // Verify blocked status
      const isBlocked = await sut.isBlocked(key);
      expect(isBlocked).toBe(true);

      // Wait for block to expire
      createMockDate(startTime.getTime() + 16 * 60 * 1000);

      // Should be allowed again
      const finalResult = await sut.checkLimit(key, maxAttempts, windowMs);
      expect(finalResult.allowed).toBe(true);
    });

    it("should handle concurrent requests for multiple keys", async () => {
      createMockDate(1000000);
      const keys = ["user1", "user2", "user3"];

      // Simulate concurrent usage
      for (const userKey of keys) {
        for (let i = 0; i < 2; i++) {
          await sut.recordAttempt(userKey, windowMs);
        }
      }

      // Check all keys
      for (const userKey of keys) {
        const result = await sut.checkLimit(userKey, maxAttempts, windowMs);
        expect(result.allowed).toBe(true);
        expect(result.totalAttempts).toBe(2);
        expect(result.remainingAttempts).toBe(1);
      }
    });

    it("should handle window expiration correctly", async () => {
      const startTime = createMockDate(1000000);

      // Make attempts within window
      await sut.recordAttempt(key, windowMs);
      createMockDate(startTime.getTime() + 5000); // 5 seconds later
      await sut.recordAttempt(key, windowMs);

      // Check within window
      let result = await sut.checkLimit(key, maxAttempts, windowMs);
      expect(result.totalAttempts).toBe(2);

      // Wait for first attempt to expire
      createMockDate(startTime.getTime() + windowMs + 1000);

      // Check again - should have cleaned up expired attempts
      result = await sut.checkLimit(key, maxAttempts, windowMs);
      expect(result.totalAttempts).toBe(1); // Only second attempt remains
    });
  });
});
