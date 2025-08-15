import { InMemoryMilitaryRankRepository } from "@infra/repositories";
import type { CreateMilitaryRankInputDTO } from "@domain/dtos";
import type { MilitaryRank } from "@domain/entities";

interface SutTypes {
  sut: InMemoryMilitaryRankRepository;
}

const makeSut = (): SutTypes => {
  const sut = new InMemoryMilitaryRankRepository();

  return {
    sut,
  };
};

describe("InMemoryMilitaryRankRepository", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  describe("create method", () => {
    it("should create a military rank successfully", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const militaryRankData: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };

      // ACT
      await sut.create(militaryRankData);

      // ASSERT
      const createdRank = await sut.findByAbbreviation("CEL");
      expect(createdRank).toEqual({
        id: expect.any(String),
        abbreviation: "CEL",
        order: 1,
      });
    });

    it("should assign sequential IDs to created military ranks", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const firstRank: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };
      const secondRank: CreateMilitaryRankInputDTO = {
        abbreviation: "TCel",
        order: 2,
      };

      // ACT
      await sut.create(firstRank);
      await sut.create(secondRank);

      // ASSERT
      const first = await sut.findByAbbreviation("CEL");
      const second = await sut.findByAbbreviation("TCel");

      expect(first?.id).toBe("1");
      expect(second?.id).toBe("2");
    });

    it("should simulate network/database delay", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const militaryRankData: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };

      // ACT
      const startTime = Date.now();
      await sut.create(militaryRankData);
      const endTime = Date.now();

      // ASSERT
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });

    it("should throw error when abbreviation already exists", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const firstRank: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };
      const duplicateAbbreviation: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 2,
      };

      await sut.create(firstRank);

      // ACT & ASSERT
      await expect(sut.create(duplicateAbbreviation)).rejects.toThrow(
        "Military rank with abbreviation 'CEL' already exists",
      );
    });

    it("should throw error when order already exists", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const firstRank: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };
      const duplicateOrder: CreateMilitaryRankInputDTO = {
        abbreviation: "TCel",
        order: 1,
      };

      await sut.create(firstRank);

      // ACT & ASSERT
      await expect(sut.create(duplicateOrder)).rejects.toThrow(
        "Military rank with order '1' already exists",
      );
    });

    it("should check abbreviation uniqueness before order uniqueness", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const firstRank: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };
      const duplicateBoth: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL", // Duplica abbreviation
        order: 1, // Duplica order também
      };

      await sut.create(firstRank);

      // ACT & ASSERT
      await expect(sut.create(duplicateBoth)).rejects.toThrow(
        "Military rank with abbreviation 'CEL' already exists",
      );
    });
  });

  describe("findByAbbreviation method", () => {
    it("should find military rank by abbreviation when exists", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const militaryRankData: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };

      await sut.create(militaryRankData);

      // ACT
      const result = await sut.findByAbbreviation("CEL");

      // ASSERT
      expect(result).toEqual({
        id: "1",
        abbreviation: "CEL",
        order: 1,
      });
    });

    it("should return null when abbreviation does not exist", async () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const result = await sut.findByAbbreviation("NONEXISTENT");

      // ASSERT
      expect(result).toBeNull();
    });

    it("should be case sensitive", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const militaryRankData: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };

      await sut.create(militaryRankData);

      // ACT
      const upperCase = await sut.findByAbbreviation("CEL");
      const lowerCase = await sut.findByAbbreviation("cel");

      // ASSERT
      expect(upperCase).not.toBeNull();
      expect(lowerCase).toBeNull();
    });

    it("should find correct rank among multiple ranks", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const ranks: CreateMilitaryRankInputDTO[] = [
        { abbreviation: "CEL", order: 1 },
        { abbreviation: "TCel", order: 2 },
        { abbreviation: "Maj", order: 3 },
      ];

      for (const rank of ranks) {
        await sut.create(rank);
      }

      // ACT
      const result = await sut.findByAbbreviation("TCel");

      // ASSERT
      expect(result).toEqual({
        id: "2",
        abbreviation: "TCel",
        order: 2,
      });
    });
  });

  describe("findByOrder method", () => {
    it("should find military rank by order when exists", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const militaryRankData: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 5,
      };

      await sut.create(militaryRankData);

      // ACT
      const result = await sut.findByOrder(5);

      // ASSERT
      expect(result).toEqual({
        id: "1",
        abbreviation: "CEL",
        order: 5,
      });
    });

    it("should return null when order does not exist", async () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const result = await sut.findByOrder(999);

      // ASSERT
      expect(result).toBeNull();
    });

    it("should find correct rank among multiple ranks", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const ranks: CreateMilitaryRankInputDTO[] = [
        { abbreviation: "CEL", order: 1 },
        { abbreviation: "TCel", order: 2 },
        { abbreviation: "Maj", order: 3 },
      ];

      for (const rank of ranks) {
        await sut.create(rank);
      }

      // ACT
      const result = await sut.findByOrder(2);

      // ASSERT
      expect(result).toEqual({
        id: "2",
        abbreviation: "TCel",
        order: 2,
      });
    });

    it("should handle edge case orders", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const minOrder: CreateMilitaryRankInputDTO = {
        abbreviation: "Min",
        order: 1,
      };
      const maxOrder: CreateMilitaryRankInputDTO = {
        abbreviation: "Max",
        order: 20,
      };

      await sut.create(minOrder);
      await sut.create(maxOrder);

      // ACT
      const minResult = await sut.findByOrder(1);
      const maxResult = await sut.findByOrder(20);

      // ASSERT
      expect(minResult?.abbreviation).toBe("Min");
      expect(maxResult?.abbreviation).toBe("Max");
    });
  });

  describe("listAll helper method", () => {
    it("should return empty array when no ranks exist", async () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const result = await sut.listAll();

      // ASSERT
      expect(result).toEqual([]);
    });

    it("should return all created military ranks", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const ranks: CreateMilitaryRankInputDTO[] = [
        { abbreviation: "CEL", order: 1 },
        { abbreviation: "TCel", order: 2 },
        { abbreviation: "Maj", order: 3 },
      ];

      for (const rank of ranks) {
        await sut.create(rank);
      }

      // ACT
      const result = await sut.listAll();

      // ASSERT
      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { id: "1", abbreviation: "CEL", order: 1 },
        { id: "2", abbreviation: "TCel", order: 2 },
        { id: "3", abbreviation: "Maj", order: 3 },
      ]);
    });

    it("should return a copy of data (immutability)", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const militaryRankData: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };

      await sut.create(militaryRankData);

      // ACT
      const result1 = await sut.listAll();
      const result2 = await sut.listAll();

      // ASSERT
      expect(result1).not.toBe(result2); // Different references
      expect(result1).toEqual(result2); // Same content
    });
  });

  describe("integration scenarios", () => {
    it("should maintain data consistency across multiple operations", async () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT - Create multiple ranks
      await sut.create({ abbreviation: "CEL", order: 1 });
      await sut.create({ abbreviation: "TCel", order: 2 });

      // Try to create duplicate (should fail)
      await expect(
        sut.create({ abbreviation: "CEL", order: 3 }),
      ).rejects.toThrow();

      // Verify original data is intact
      const cel = await sut.findByAbbreviation("CEL");
      const tcel = await sut.findByOrder(2);
      const all = await sut.listAll();

      // ASSERT
      expect(cel).toEqual({ id: "1", abbreviation: "CEL", order: 1 });
      expect(tcel).toEqual({ id: "2", abbreviation: "TCel", order: 2 });
      expect(all).toHaveLength(2);
    });

    it("should handle concurrent-like operations correctly", async () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT - Simulate concurrent operations
      const promises = [
        sut.create({ abbreviation: "A", order: 10 }),
        sut.create({ abbreviation: "B", order: 20 }),
        sut.create({ abbreviation: "C", order: 30 }),
      ];

      await Promise.all(promises);

      // ASSERT
      const all = await sut.listAll();
      expect(all).toHaveLength(3);
      expect(all.map((r) => r.abbreviation)).toEqual(
        expect.arrayContaining(["A", "B", "C"]),
      );
    });
  });

  describe("logging behavior", () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, "log").mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it("should log create operations", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const militaryRankData: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };

      // ACT
      await sut.create(militaryRankData);

      // ASSERT
      expect(consoleSpy).toHaveBeenCalledWith(
        "🗄️ [INFRA] Salvando no 'banco':",
        militaryRankData,
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "✅ [INFRA] Salvo com sucesso! ID:",
        "1",
      );
    });

    it("should log find operations", async () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      await sut.findByAbbreviation("TEST");
      await sut.findByOrder(5);

      // ASSERT
      expect(consoleSpy).toHaveBeenCalledWith(
        "🔍 [INFRA] Buscando por abbreviation:",
        "TEST",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "🔍 [INFRA] Buscando por order:",
        5,
      );
    });
  });
});
