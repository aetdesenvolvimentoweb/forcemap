import { DatabaseSeed } from "../../../../src/main/seed/database.seed";
import { SeedManager } from "../../../../src/main/seed/seed.manager";

// Mock the factory
jest.mock("../../../../src/main/factories/seed/database.seed.factory", () => ({
  makeDatabaseSeed: jest.fn(),
}));

import { makeDatabaseSeed } from "../../../../src/main/factories/seed/database.seed.factory";

describe("SeedManager", () => {
  let mockDatabaseSeed: jest.Mocked<DatabaseSeed>;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton instance
    (SeedManager as any).instance = undefined;

    // Create a mock DatabaseSeed
    mockDatabaseSeed = {
      run: jest.fn(),
    } as any;

    (makeDatabaseSeed as jest.Mock).mockReturnValue(mockDatabaseSeed);
  });

  describe("getInstance", () => {
    it("should return the same instance on multiple calls (Singleton pattern)", () => {
      const instance1 = SeedManager.getInstance();
      const instance2 = SeedManager.getInstance();

      expect(instance1).toBe(instance2);
    });

    it("should create a new instance only once", () => {
      const instance1 = SeedManager.getInstance();
      const instance2 = SeedManager.getInstance();
      const instance3 = SeedManager.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
      expect(instance1).toBe(instance3);
    });
  });

  describe("ensureSeeded", () => {
    it("should run seed successfully on first call", async () => {
      mockDatabaseSeed.run.mockResolvedValue(undefined);

      const manager = SeedManager.getInstance();
      await manager.ensureSeeded();

      expect(console.log).toHaveBeenCalledWith("🌱 Starting database seed...");
      expect(makeDatabaseSeed).toHaveBeenCalledTimes(1);
      expect(mockDatabaseSeed.run).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        "🌱 Database seed completed successfully",
      );
    });

    it("should not run seed again if already seeded", async () => {
      mockDatabaseSeed.run.mockResolvedValue(undefined);

      const manager = SeedManager.getInstance();

      // First call
      await manager.ensureSeeded();

      jest.clearAllMocks();

      // Second call
      await manager.ensureSeeded();

      expect(console.log).not.toHaveBeenCalled();
      expect(makeDatabaseSeed).not.toHaveBeenCalled();
      expect(mockDatabaseSeed.run).not.toHaveBeenCalled();
    });

    it("should handle multiple concurrent calls correctly", async () => {
      mockDatabaseSeed.run.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      const manager = SeedManager.getInstance();

      // Start multiple concurrent calls
      const promises = [
        manager.ensureSeeded(),
        manager.ensureSeeded(),
        manager.ensureSeeded(),
      ];

      await Promise.all(promises);

      // Should only call the seed once despite multiple concurrent calls
      expect(makeDatabaseSeed).toHaveBeenCalledTimes(1);
      expect(mockDatabaseSeed.run).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith("🌱 Starting database seed...");
      expect(console.log).toHaveBeenCalledWith(
        "🌱 Database seed completed successfully",
      );
    });

    it("should handle seed failure and allow retry", async () => {
      const error = new Error("Database connection failed");
      mockDatabaseSeed.run.mockRejectedValue(error);

      const manager = SeedManager.getInstance();

      // First attempt should fail
      await expect(manager.ensureSeeded()).rejects.toThrow(
        "Database connection failed",
      );

      expect(console.log).toHaveBeenCalledWith("🌱 Starting database seed...");
      expect(console.error).toHaveBeenCalledWith(
        "❌ Database seed failed:",
        error,
      );
      expect(makeDatabaseSeed).toHaveBeenCalledTimes(1);
      expect(mockDatabaseSeed.run).toHaveBeenCalledTimes(1);

      // Reset mocks for retry
      jest.clearAllMocks();
      mockDatabaseSeed.run.mockResolvedValue(undefined);

      // Second attempt should succeed
      await manager.ensureSeeded();

      expect(console.log).toHaveBeenCalledWith("🌱 Starting database seed...");
      expect(console.log).toHaveBeenCalledWith(
        "🌱 Database seed completed successfully",
      );
      expect(makeDatabaseSeed).toHaveBeenCalledTimes(1);
      expect(mockDatabaseSeed.run).toHaveBeenCalledTimes(1);
    });

    it("should log start message only once for multiple concurrent calls", async () => {
      let resolvePromise: () => void;
      const seedPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      mockDatabaseSeed.run.mockReturnValue(seedPromise);

      const manager = SeedManager.getInstance();

      // Start multiple concurrent calls
      const promise1 = manager.ensureSeeded();
      const promise2 = manager.ensureSeeded();
      const promise3 = manager.ensureSeeded();

      // Verify that "Starting database seed..." is logged only once
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith("🌱 Starting database seed...");

      // Resolve the seed promise
      resolvePromise!();
      await Promise.all([promise1, promise2, promise3]);

      // Verify final success message
      expect(console.log).toHaveBeenCalledWith(
        "🌱 Database seed completed successfully",
      );
    });

    it("should handle seed failure during concurrent calls", async () => {
      const error = new Error("Seed failed");
      mockDatabaseSeed.run.mockRejectedValue(error);

      const manager = SeedManager.getInstance();

      // All concurrent calls should fail with the same error
      const promises = [
        manager.ensureSeeded(),
        manager.ensureSeeded(),
        manager.ensureSeeded(),
      ];

      await expect(Promise.all(promises)).rejects.toThrow("Seed failed");

      // Should only attempt once
      expect(makeDatabaseSeed).toHaveBeenCalledTimes(1);
      expect(mockDatabaseSeed.run).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        "❌ Database seed failed:",
        error,
      );
    });
  });

  describe("getStatus", () => {
    it("should return correct status when not seeded", () => {
      const manager = SeedManager.getInstance();
      const status = manager.getStatus();

      expect(status).toEqual({
        isSeeded: false,
        isSeeding: false,
      });
    });

    it("should return correct status when seeding is in progress", async () => {
      let resolvePromise: () => void;
      const seedPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      mockDatabaseSeed.run.mockReturnValue(seedPromise);

      const manager = SeedManager.getInstance();

      // Start seeding but don't await
      const seedingPromise = manager.ensureSeeded();

      // Check status while seeding
      const statusWhileSeeding = manager.getStatus();
      expect(statusWhileSeeding).toEqual({
        isSeeded: false,
        isSeeding: true,
      });

      // Complete seeding
      resolvePromise!();
      await seedingPromise;

      // Check status after seeding
      const statusAfterSeeding = manager.getStatus();
      expect(statusAfterSeeding).toEqual({
        isSeeded: true,
        isSeeding: false,
      });
    });

    it("should return correct status when seeded", async () => {
      mockDatabaseSeed.run.mockResolvedValue(undefined);

      const manager = SeedManager.getInstance();
      await manager.ensureSeeded();

      const status = manager.getStatus();
      expect(status).toEqual({
        isSeeded: true,
        isSeeding: false,
      });
    });

    it("should return correct status after seed failure", async () => {
      const error = new Error("Seed failed");
      mockDatabaseSeed.run.mockRejectedValue(error);

      const manager = SeedManager.getInstance();

      try {
        await manager.ensureSeeded();
      } catch {
        // Expected to fail
      }

      const status = manager.getStatus();
      expect(status).toEqual({
        isSeeded: false,
        isSeeding: false,
      });
    });
  });

  describe("error handling", () => {
    it("should propagate seed errors", async () => {
      const customError = new Error("Custom seed error");
      mockDatabaseSeed.run.mockRejectedValue(customError);

      const manager = SeedManager.getInstance();

      await expect(manager.ensureSeeded()).rejects.toThrow("Custom seed error");
      expect(console.error).toHaveBeenCalledWith(
        "❌ Database seed failed:",
        customError,
      );
    });

    it("should reset seed promise on failure to allow retry", async () => {
      const error = new Error("First attempt failed");
      mockDatabaseSeed.run.mockRejectedValueOnce(error);

      const manager = SeedManager.getInstance();

      // First attempt fails
      await expect(manager.ensureSeeded()).rejects.toThrow(
        "First attempt failed",
      );

      // Verify status shows not seeding after failure
      expect(manager.getStatus().isSeeding).toBe(false);

      // Reset mock for second attempt
      jest.clearAllMocks();
      mockDatabaseSeed.run.mockResolvedValue(undefined);

      // Second attempt should succeed
      await manager.ensureSeeded();

      expect(console.log).toHaveBeenCalledWith(
        "🌱 Database seed completed successfully",
      );
      expect(manager.getStatus().isSeeded).toBe(true);
    });

    it("should handle multiple retry attempts", async () => {
      const error1 = new Error("First failure");
      const error2 = new Error("Second failure");

      mockDatabaseSeed.run
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2)
        .mockResolvedValue(undefined);

      const manager = SeedManager.getInstance();

      // First attempt
      await expect(manager.ensureSeeded()).rejects.toThrow("First failure");
      expect(manager.getStatus().isSeeded).toBe(false);

      // Second attempt
      jest.clearAllMocks();
      await expect(manager.ensureSeeded()).rejects.toThrow("Second failure");
      expect(manager.getStatus().isSeeded).toBe(false);

      // Third attempt succeeds
      jest.clearAllMocks();
      await manager.ensureSeeded();
      expect(manager.getStatus().isSeeded).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        "🌱 Database seed completed successfully",
      );
    });
  });

  describe("singleton behavior with multiple instances", () => {
    it("should maintain state across getInstance calls", async () => {
      mockDatabaseSeed.run.mockResolvedValue(undefined);

      const manager1 = SeedManager.getInstance();
      await manager1.ensureSeeded();

      const manager2 = SeedManager.getInstance();
      const status = manager2.getStatus();

      expect(status.isSeeded).toBe(true);
      expect(manager1).toBe(manager2);
    });

    it("should share seeding state across instances", async () => {
      let resolvePromise: () => void;
      const seedPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      mockDatabaseSeed.run.mockReturnValue(seedPromise);

      const manager1 = SeedManager.getInstance();
      const seedingPromise = manager1.ensureSeeded();

      const manager2 = SeedManager.getInstance();
      const status = manager2.getStatus();

      expect(status.isSeeding).toBe(true);
      expect(status.isSeeded).toBe(false);

      resolvePromise!();
      await seedingPromise;

      const finalStatus = manager2.getStatus();
      expect(finalStatus.isSeeded).toBe(true);
      expect(finalStatus.isSeeding).toBe(false);
    });
  });

  describe("logging behavior", () => {
    it("should log appropriate messages during successful seed", async () => {
      mockDatabaseSeed.run.mockResolvedValue(undefined);

      const manager = SeedManager.getInstance();
      await manager.ensureSeeded();

      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenNthCalledWith(
        1,
        "🌱 Starting database seed...",
      );
      expect(console.log).toHaveBeenNthCalledWith(
        2,
        "🌱 Database seed completed successfully",
      );
    });

    it("should log error messages during failed seed", async () => {
      const error = new Error("Test error");
      mockDatabaseSeed.run.mockRejectedValue(error);

      const manager = SeedManager.getInstance();

      try {
        await manager.ensureSeeded();
      } catch {
        // Expected
      }

      expect(console.log).toHaveBeenCalledWith("🌱 Starting database seed...");
      expect(console.error).toHaveBeenCalledWith(
        "❌ Database seed failed:",
        error,
      );
    });

    it("should not log completion message on failure", async () => {
      const error = new Error("Test error");
      mockDatabaseSeed.run.mockRejectedValue(error);

      const manager = SeedManager.getInstance();

      try {
        await manager.ensureSeeded();
      } catch {
        // Expected
      }

      expect(console.log).not.toHaveBeenCalledWith(
        "🌱 Database seed completed successfully",
      );
    });
  });
});
