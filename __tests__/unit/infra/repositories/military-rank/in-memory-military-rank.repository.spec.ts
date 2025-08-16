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
});
