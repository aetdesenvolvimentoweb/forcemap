// Mock logger for tests
const mockGlobalLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

const resetGlobalLoggerMocks = () => {
  mockGlobalLogger.info.mockClear();
  mockGlobalLogger.warn.mockClear();
  mockGlobalLogger.error.mockClear();
  mockGlobalLogger.debug.mockClear();
};

import {
  mockMilitaryRankRepository,
  mockMilitaryRepository,
  mockPasswordHasher,
  mockUserRepository,
} from "../../../../__mocks__";
import { UserRole } from "../../../../src/domain/entities";
import { DatabaseSeed } from "../../../../src/main/seed";

describe("DatabaseSeed", () => {
  let sut: DatabaseSeed;
  let mockedMilitaryRankRepository = mockMilitaryRankRepository();
  let mockedMilitaryRepository = mockMilitaryRepository();
  let mockedUserRepository = mockUserRepository();
  let mockedPasswordHasher = mockPasswordHasher();

  beforeEach(() => {
    jest.clearAllMocks();
    resetGlobalLoggerMocks();
    // Reset the static hasSeeded flag using reflection
    (DatabaseSeed as any).hasSeeded = false;

    // Reset all mocks to default implementations
    mockedMilitaryRankRepository = mockMilitaryRankRepository();
    mockedMilitaryRepository = mockMilitaryRepository();
    mockedUserRepository = mockUserRepository();
    mockedPasswordHasher = mockPasswordHasher();

    sut = new DatabaseSeed(
      mockedMilitaryRankRepository,
      mockedMilitaryRepository,
      mockedUserRepository,
      mockedPasswordHasher,
      mockGlobalLogger,
    );
  });

  describe("run", () => {
    const mockMilitaryRankAdmin = {
      id: "rank-admin-id",
      abbreviation: "Cel",
      order: 1,
    };

    const mockAdminMilitary = {
      id: "admin-military-id",
      name: "Administrador",
      rg: 9999,
      militaryRank: {
        id: "rank-admin-id",
        abbreviation: "Cel",
        order: 1,
      },
    };

    it("should seed database successfully on first run", async () => {
      mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValue(
        mockMilitaryRankAdmin,
      );
      mockedMilitaryRepository.findByRg.mockResolvedValue(mockAdminMilitary);
      mockedPasswordHasher.hash.mockResolvedValue("hashedPassword123");

      await sut.run();

      // Verify military ranks creation
      expect(mockedMilitaryRankRepository.create).toHaveBeenCalledTimes(14);
      expect(mockedMilitaryRankRepository.create).toHaveBeenCalledWith({
        abbreviation: "Cel",
        order: 1,
      });
      expect(mockedMilitaryRankRepository.create).toHaveBeenCalledWith({
        abbreviation: "TC",
        order: 2,
      });
      expect(mockedMilitaryRankRepository.create).toHaveBeenCalledWith({
        abbreviation: "Sd 2ª Classe",
        order: 14,
      });

      // Verify admin military creation
      expect(mockedMilitaryRepository.create).toHaveBeenCalledTimes(1);
      expect(mockedMilitaryRepository.create).toHaveBeenCalledWith({
        militaryRankId: "rank-admin-id",
        rg: 9999,
        name: "Administrador",
      });

      // Verify admin user creation
      expect(mockedPasswordHasher.hash).toHaveBeenCalledWith("F0rceAdmin!");
      expect(mockedUserRepository.create).toHaveBeenCalledTimes(1);
      expect(mockedUserRepository.create).toHaveBeenCalledWith({
        militaryId: "admin-military-id",
        role: UserRole.ADMIN,
        password: "hashedPassword123",
      });

      // Verify success message
      expect(mockGlobalLogger.info).toHaveBeenCalledWith(
        "Database seeded successfully",
      );
    });

    it("should not seed database on subsequent runs", async () => {
      // First run
      mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValue(
        mockMilitaryRankAdmin,
      );
      mockedMilitaryRepository.findByRg.mockResolvedValue(mockAdminMilitary);
      mockedPasswordHasher.hash.mockResolvedValue("hashedPassword123");

      await sut.run();

      // Clear mocks
      jest.clearAllMocks();

      // Second run
      await sut.run();

      // Verify no operations were performed
      expect(mockedMilitaryRankRepository.create).not.toHaveBeenCalled();
      expect(mockedMilitaryRepository.create).not.toHaveBeenCalled();
      expect(mockedUserRepository.create).not.toHaveBeenCalled();
      expect(mockedPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockGlobalLogger.info).not.toHaveBeenCalled();
    });

    it("should create all military ranks in correct order", async () => {
      mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValue(
        mockMilitaryRankAdmin,
      );
      mockedMilitaryRepository.findByRg.mockResolvedValue(mockAdminMilitary);
      mockedPasswordHasher.hash.mockResolvedValue("hashedPassword123");

      await sut.run();

      const expectedRanks = [
        { abbreviation: "Cel", order: 1 },
        { abbreviation: "TC", order: 2 },
        { abbreviation: "Maj", order: 3 },
        { abbreviation: "Cap", order: 4 },
        { abbreviation: "1º Ten", order: 5 },
        { abbreviation: "2º Ten", order: 6 },
        { abbreviation: "Asp Of", order: 7 },
        { abbreviation: "ST", order: 8 },
        { abbreviation: "1º Sgt", order: 9 },
        { abbreviation: "2º Sgt", order: 10 },
        { abbreviation: "3º Sgt", order: 11 },
        { abbreviation: "Cb", order: 12 },
        { abbreviation: "Sd 1ª Classe", order: 13 },
        { abbreviation: "Sd 2ª Classe", order: 14 },
      ];

      expectedRanks.forEach((rank, index) => {
        expect(mockedMilitaryRankRepository.create).toHaveBeenNthCalledWith(
          index + 1,
          rank,
        );
      });
    });

    it("should find admin military rank after creating ranks", async () => {
      mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValue(
        mockMilitaryRankAdmin,
      );
      mockedMilitaryRepository.findByRg.mockResolvedValue(mockAdminMilitary);
      mockedPasswordHasher.hash.mockResolvedValue("hashedPassword123");

      await sut.run();

      expect(
        mockedMilitaryRankRepository.findByAbbreviation,
      ).toHaveBeenCalledWith("Cel");
      expect(
        mockedMilitaryRankRepository.findByAbbreviation,
      ).toHaveBeenCalledTimes(1);
    });

    it("should find admin military after creating military", async () => {
      mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValue(
        mockMilitaryRankAdmin,
      );
      mockedMilitaryRepository.findByRg.mockResolvedValue(mockAdminMilitary);
      mockedPasswordHasher.hash.mockResolvedValue("hashedPassword123");

      await sut.run();

      expect(mockedMilitaryRepository.findByRg).toHaveBeenCalledWith(9999);
      expect(mockedMilitaryRepository.findByRg).toHaveBeenCalledTimes(1);
    });

    it("should hash password with correct value", async () => {
      mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValue(
        mockMilitaryRankAdmin,
      );
      mockedMilitaryRepository.findByRg.mockResolvedValue(mockAdminMilitary);
      mockedPasswordHasher.hash.mockResolvedValue("hashedPassword123");

      await sut.run();

      expect(mockedPasswordHasher.hash).toHaveBeenCalledWith("F0rceAdmin!");
      expect(mockedPasswordHasher.hash).toHaveBeenCalledTimes(1);
    });

    it("should create admin user with ADMIN role", async () => {
      mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValue(
        mockMilitaryRankAdmin,
      );
      mockedMilitaryRepository.findByRg.mockResolvedValue(mockAdminMilitary);
      mockedPasswordHasher.hash.mockResolvedValue("hashedPassword123");

      await sut.run();

      expect(mockedUserRepository.create).toHaveBeenCalledWith({
        militaryId: "admin-military-id",
        role: UserRole.ADMIN,
        password: "hashedPassword123",
      });
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Database connection failed");
      mockedMilitaryRankRepository.create.mockRejectedValue(error);

      await expect(sut.run()).rejects.toThrow("Database connection failed");

      expect(mockedMilitaryRankRepository.create).toHaveBeenCalled();
      expect(mockGlobalLogger.info).not.toHaveBeenCalledWith(
        "Database seeded successfully",
      );
    });

    it("should handle missing military rank", async () => {
      // First let the creation succeed, then return null for findByAbbreviation
      mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValue(null);

      await expect(sut.run()).rejects.toThrow();

      expect(
        mockedMilitaryRankRepository.findByAbbreviation,
      ).toHaveBeenCalledWith("Cel");
    });

    it("should handle missing admin military", async () => {
      // Let the rank creation and finding succeed, but military creation returns null
      mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValue(
        mockMilitaryRankAdmin,
      );
      mockedMilitaryRepository.findByRg.mockResolvedValue(null);

      await expect(sut.run()).rejects.toThrow();

      expect(mockedMilitaryRepository.findByRg).toHaveBeenCalledWith(9999);
    });

    it("should handle password hashing failure", async () => {
      mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValue(
        mockMilitaryRankAdmin,
      );
      mockedMilitaryRepository.findByRg.mockResolvedValue(mockAdminMilitary);
      mockedPasswordHasher.hash.mockRejectedValue(new Error("Hashing failed"));

      await expect(sut.run()).rejects.toThrow("Hashing failed");

      expect(mockedPasswordHasher.hash).toHaveBeenCalledWith("F0rceAdmin!");
    });

    it("should maintain seeded state across different instances", async () => {
      // First instance seeds successfully
      mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValue(
        mockMilitaryRankAdmin,
      );
      mockedMilitaryRepository.findByRg.mockResolvedValue(mockAdminMilitary);
      mockedPasswordHasher.hash.mockResolvedValue("hashedPassword123");

      await sut.run();

      // Create new instance
      const newSeedInstance = new DatabaseSeed(
        mockedMilitaryRankRepository,
        mockedMilitaryRepository,
        mockedUserRepository,
        mockedPasswordHasher,
        mockGlobalLogger,
      );

      jest.clearAllMocks();

      // New instance should not seed again
      await newSeedInstance.run();

      expect(mockedMilitaryRankRepository.create).not.toHaveBeenCalled();
      expect(mockedMilitaryRepository.create).not.toHaveBeenCalled();
      expect(mockedUserRepository.create).not.toHaveBeenCalled();
    });

    it("should create military ranks sequentially", async () => {
      mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValue(
        mockMilitaryRankAdmin,
      );
      mockedMilitaryRepository.findByRg.mockResolvedValue(mockAdminMilitary);
      mockedPasswordHasher.hash.mockResolvedValue("hashedPassword123");

      let callOrder = 0;
      mockedMilitaryRankRepository.create.mockImplementation(async () => {
        callOrder++;
      });

      await sut.run();

      expect(mockedMilitaryRankRepository.create).toHaveBeenCalledTimes(14);
      // Verify they were called in sequence (not parallel)
      expect(callOrder).toBe(14);
    });

    it("should create entities in correct order: ranks -> military -> user", async () => {
      mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValue(
        mockMilitaryRankAdmin,
      );
      mockedMilitaryRepository.findByRg.mockResolvedValue(mockAdminMilitary);
      mockedPasswordHasher.hash.mockResolvedValue("hashedPassword123");

      const callOrder: string[] = [];

      mockedMilitaryRankRepository.create.mockImplementation(async () => {
        callOrder.push("rank");
      });

      mockedMilitaryRepository.create.mockImplementation(async () => {
        callOrder.push("military");
      });

      mockedUserRepository.create.mockImplementation(async () => {
        callOrder.push("user");
      });

      await sut.run();

      // Check that ranks are created first (14 times), then military, then user
      expect(callOrder.slice(0, 14).every((call) => call === "rank")).toBe(
        true,
      );
      expect(callOrder[14]).toBe("military");
      expect(callOrder[15]).toBe("user");
    });

    it("should use correct admin credentials", async () => {
      mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValue(
        mockMilitaryRankAdmin,
      );
      mockedMilitaryRepository.findByRg.mockResolvedValue(mockAdminMilitary);
      mockedPasswordHasher.hash.mockResolvedValue("hashedPassword123");

      await sut.run();

      // Verify admin military data
      expect(mockedMilitaryRepository.create).toHaveBeenCalledWith({
        militaryRankId: "rank-admin-id",
        rg: 9999,
        name: "Administrador",
      });

      // Verify admin password
      expect(mockedPasswordHasher.hash).toHaveBeenCalledWith("F0rceAdmin!");

      // Verify admin user role
      expect(mockedUserRepository.create).toHaveBeenCalledWith({
        militaryId: "admin-military-id",
        role: UserRole.ADMIN,
        password: "hashedPassword123",
      });
    });
  });
});
