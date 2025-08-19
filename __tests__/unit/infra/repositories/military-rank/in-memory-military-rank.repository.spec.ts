import { InMemoryMilitaryRankRepository } from "@infra/repositories";
import type { CreateMilitaryRankInputDTO } from "@domain/dtos";

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

    it("should generate unique UUIDs for created military ranks", async () => {
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

      expect(first?.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(second?.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(first?.id).not.toBe(second?.id);
    });

    it("should create military rank and be immediately available", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const militaryRankData: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };

      // ACT
      await sut.create(militaryRankData);

      // ASSERT - Verificar que foi criado e está disponível
      const created = await sut.findByAbbreviation("CEL");
      expect(created).toBeDefined();
      expect(created).toEqual({
        id: expect.any(String),
        abbreviation: "CEL",
        order: 1,
      });
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
        id: expect.any(String),
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
        id: expect.any(String),
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
        id: expect.any(String),
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
        id: expect.any(String),
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

  describe("listAll method", () => {
    it("should return empty array when no ranks exist", async () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const result = await sut.listAll();

      // ASSERT
      expect(result).toEqual([]);
    });

    it("should return all created ranks", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const ranks: CreateMilitaryRankInputDTO[] = [
        { abbreviation: "GEN", order: 1 },
        { abbreviation: "CEL", order: 2 },
        { abbreviation: "MAJ", order: 3 },
      ];

      for (const rank of ranks) {
        await sut.create(rank);
      }

      // ACT
      const result = await sut.listAll();

      // ASSERT
      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { id: expect.any(String), abbreviation: "GEN", order: 1 },
        { id: expect.any(String), abbreviation: "CEL", order: 2 },
        { id: expect.any(String), abbreviation: "MAJ", order: 3 },
      ]);
    });

    it("should return copy of data (immutability)", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      await sut.create({ abbreviation: "CPT", order: 1 });

      // ACT
      const result1 = await sut.listAll();
      const result2 = await sut.listAll();

      // ASSERT
      expect(result1).not.toBe(result2); // Different instances
      expect(result1).toEqual(result2); // Same content
    });
  });

  describe("listById method", () => {
    it("should return military rank by id when exists", async () => {
      const { sut } = sutInstance;
      const rankData: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };
      await sut.create(rankData);
      const created = await sut.findByAbbreviation("CEL");
      const result = await sut.listById(created!.id);
      expect(result).toEqual({
        id: created!.id,
        abbreviation: "CEL",
        order: 1,
      });
    });

    it("should return null when id does not exist", async () => {
      const { sut } = sutInstance;
      const result = await sut.listById("non-existent-id");
      expect(result).toBeNull();
    });

    it("should find correct rank among multiple ranks by id", async () => {
      const { sut } = sutInstance;
      const ranks: CreateMilitaryRankInputDTO[] = [
        { abbreviation: "CEL", order: 1 },
        { abbreviation: "TCel", order: 2 },
        { abbreviation: "Maj", order: 3 },
      ];
      const ids: string[] = [];
      for (const rank of ranks) {
        await sut.create(rank);
        const created = await sut.findByAbbreviation(rank.abbreviation);
        if (created) {
          ids.push(created.id);
        }
      }
      // Garantir que temos o id esperado
      expect(ids).toHaveLength(3);
      const result = await sut.listById(ids[1]!);
      expect(result).toEqual({
        id: ids[1]!,
        abbreviation: "TCel",
        order: 2,
      });
    });
  });

  describe("delete method", () => {
    it("should delete a military rank by id", async () => {
      const { sut } = sutInstance;
      const rankData: CreateMilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 1,
      };
      await sut.create(rankData);
      const created = await sut.findByAbbreviation("CEL");
      expect(await sut.listById(created!.id)).not.toBeNull();
      await sut.delete(created!.id);
      expect(await sut.listById(created!.id)).toBeNull();
    });

    it("should not throw if id does not exist", async () => {
      const { sut } = sutInstance;
      await expect(sut.delete("non-existent-id")).resolves.toBeUndefined();
    });

    it("should only delete the specified id", async () => {
      const { sut } = sutInstance;
      const ranks: CreateMilitaryRankInputDTO[] = [
        { abbreviation: "CEL", order: 1 },
        { abbreviation: "TCel", order: 2 },
      ];
      for (const rank of ranks) {
        await sut.create(rank);
      }
      const cel = await sut.findByAbbreviation("CEL");
      const tcel = await sut.findByAbbreviation("TCel");
      await sut.delete(cel!.id);
      expect(await sut.listById(cel!.id)).toBeNull();
      expect(await sut.listById(tcel!.id)).not.toBeNull();
    });
  });
});
