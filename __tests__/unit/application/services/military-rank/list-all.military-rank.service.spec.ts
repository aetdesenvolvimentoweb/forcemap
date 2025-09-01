import { mockMilitaryRankRepository } from "../../../../../__mocks__";
import { ListAllMilitaryRankService } from "../../../../../src/application/services";
import { MilitaryRank } from "../../../../../src/domain/entities";

describe("ListAllMilitaryRankService", () => {
  let sut: ListAllMilitaryRankService;
  let mockedRepository = mockMilitaryRankRepository();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new ListAllMilitaryRankService({
      militaryRankRepository: mockedRepository,
    });
  });

  describe("listAll", () => {
    it("should return empty array when no military ranks exist", async () => {
      const emptyResult: MilitaryRank[] = [];
      mockedRepository.listAll.mockResolvedValueOnce(emptyResult);

      const result = await sut.listAll();

      expect(result).toEqual(emptyResult);
      expect(result).toHaveLength(0);
    });

    it("should return array of military ranks when they exist", async () => {
      const militaryRanks: MilitaryRank[] = [
        {
          id: "1",
          abbreviation: "CEL",
          order: 10,
        },
        {
          id: "2",
          abbreviation: "MAJ",
          order: 8,
        },
        {
          id: "3",
          abbreviation: "CAP",
          order: 6,
        },
      ];

      mockedRepository.listAll.mockResolvedValueOnce(militaryRanks);

      const result = await sut.listAll();

      expect(result).toEqual(militaryRanks);
      expect(result).toHaveLength(3);
    });

    it("should call repository listAll method", async () => {
      const militaryRanks: MilitaryRank[] = [];
      mockedRepository.listAll.mockResolvedValueOnce(militaryRanks);

      await sut.listAll();

      expect(mockedRepository.listAll).toHaveBeenCalledTimes(1);
      expect(mockedRepository.listAll).toHaveBeenCalledWith();
    });

    it("should propagate repository exceptions", async () => {
      const repositoryError = new Error("Database connection failed");
      mockedRepository.listAll.mockRejectedValueOnce(repositoryError);

      await expect(sut.listAll()).rejects.toThrow(repositoryError);
      expect(mockedRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should return single military rank when only one exists", async () => {
      const singleMilitaryRank: MilitaryRank[] = [
        {
          id: "1",
          abbreviation: "GEN",
          order: 12,
        },
      ];

      mockedRepository.listAll.mockResolvedValueOnce(singleMilitaryRank);

      const result = await sut.listAll();

      expect(result).toEqual(singleMilitaryRank);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "1",
        abbreviation: "GEN",
        order: 12,
      });
    });

    it("should handle multiple concurrent calls independently", async () => {
      const militaryRanks1: MilitaryRank[] = [
        { id: "1", abbreviation: "CEL", order: 10 },
      ];
      const militaryRanks2: MilitaryRank[] = [
        { id: "2", abbreviation: "MAJ", order: 8 },
        { id: "3", abbreviation: "CAP", order: 6 },
      ];

      mockedRepository.listAll
        .mockResolvedValueOnce(militaryRanks1)
        .mockResolvedValueOnce(militaryRanks2);

      const [result1, result2] = await Promise.all([
        sut.listAll(),
        sut.listAll(),
      ]);

      expect(result1).toEqual(militaryRanks1);
      expect(result2).toEqual(militaryRanks2);
      expect(mockedRepository.listAll).toHaveBeenCalledTimes(2);
    });

    it("should preserve military rank data structure integrity", async () => {
      const militaryRank: MilitaryRank = {
        id: "uuid-123",
        abbreviation: "1º TEN",
        order: 4,
      };

      mockedRepository.listAll.mockResolvedValueOnce([militaryRank]);

      const result = await sut.listAll();

      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("abbreviation");
      expect(result[0]).toHaveProperty("order");
      expect(typeof result[0].id).toBe("string");
      expect(typeof result[0].abbreviation).toBe("string");
      expect(typeof result[0].order).toBe("number");
    });

    it("should handle military ranks with special characters in abbreviation", async () => {
      const militaryRanksWithSpecialChars: MilitaryRank[] = [
        {
          id: "1",
          abbreviation: "1º SGT",
          order: 5,
        },
        {
          id: "2",
          abbreviation: "2º SGT",
          order: 4,
        },
      ];

      mockedRepository.listAll.mockResolvedValueOnce(
        militaryRanksWithSpecialChars,
      );

      const result = await sut.listAll();

      expect(result).toEqual(militaryRanksWithSpecialChars);
      expect(result[0].abbreviation).toBe("1º SGT");
      expect(result[1].abbreviation).toBe("2º SGT");
    });

    it("should handle military ranks with zero order", async () => {
      const militaryRankWithZeroOrder: MilitaryRank[] = [
        {
          id: "1",
          abbreviation: "REC",
          order: 0,
        },
      ];

      mockedRepository.listAll.mockResolvedValueOnce(militaryRankWithZeroOrder);

      const result = await sut.listAll();

      expect(result).toEqual(militaryRankWithZeroOrder);
      expect(result[0].order).toBe(0);
    });
  });
});
