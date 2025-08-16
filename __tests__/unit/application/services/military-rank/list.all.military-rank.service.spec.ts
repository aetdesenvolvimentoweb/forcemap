import type { MilitaryRank } from "@domain/entities";
import type { MilitaryRankRepository } from "@domain/repositories";
import { ListAllMilitaryRankService } from "@application/services/military-rank/list.all.military-rank.service";

interface SutTypes {
  sut: ListAllMilitaryRankService;
  mockMilitaryRankRepository: jest.Mocked<MilitaryRankRepository>;
}

const makeSut = (): SutTypes => {
  const mockMilitaryRankRepository: jest.Mocked<MilitaryRankRepository> = {
    create: jest.fn(),
    findByAbbreviation: jest.fn(),
    findByOrder: jest.fn(),
    listAll: jest.fn(),
  };

  const sut = new ListAllMilitaryRankService({
    militaryRankRepository: mockMilitaryRankRepository,
  });

  return {
    sut,
    mockMilitaryRankRepository,
  };
};

describe("ListAllMilitaryRankService", () => {
  describe("successful listing", () => {
    it("should call militaryRankRepository.listAll", async () => {
      // ARRANGE
      const { sut, mockMilitaryRankRepository } = makeSut();
      const mockResult: MilitaryRank[] = [
        { id: "1", abbreviation: "SGT", order: 5 },
        { id: "2", abbreviation: "TEN", order: 10 },
      ];
      mockMilitaryRankRepository.listAll.mockResolvedValue(mockResult);

      // ACT
      await sut.listAll();

      // ASSERT
      expect(mockMilitaryRankRepository.listAll).toHaveBeenCalledTimes(1);
      expect(mockMilitaryRankRepository.listAll).toHaveBeenCalledWith();
    });

    it("should return all military ranks from repository", async () => {
      // ARRANGE
      const { sut, mockMilitaryRankRepository } = makeSut();
      const mockResult: MilitaryRank[] = [
        { id: "uuid-1", abbreviation: "CAB", order: 1 },
        { id: "uuid-2", abbreviation: "SGT", order: 5 },
        { id: "uuid-3", abbreviation: "TEN", order: 10 },
      ];
      mockMilitaryRankRepository.listAll.mockResolvedValue(mockResult);

      // ACT
      const result = await sut.listAll();

      // ASSERT
      expect(result).toEqual(mockResult);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: "uuid-1",
        abbreviation: "CAB",
        order: 1,
      });
      expect(result[1]).toEqual({
        id: "uuid-2",
        abbreviation: "SGT",
        order: 5,
      });
      expect(result[2]).toEqual({
        id: "uuid-3",
        abbreviation: "TEN",
        order: 10,
      });
    });

    it("should return empty array when no military ranks exist", async () => {
      // ARRANGE
      const { sut, mockMilitaryRankRepository } = makeSut();
      const mockResult: MilitaryRank[] = [];
      mockMilitaryRankRepository.listAll.mockResolvedValue(mockResult);

      // ACT
      const result = await sut.listAll();

      // ASSERT
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockMilitaryRankRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should preserve order returned by repository", async () => {
      // ARRANGE
      const { sut, mockMilitaryRankRepository } = makeSut();
      const mockResult: MilitaryRank[] = [
        { id: "3", abbreviation: "TEN", order: 10 },
        { id: "1", abbreviation: "CAB", order: 1 },
        { id: "2", abbreviation: "SGT", order: 5 },
      ];
      mockMilitaryRankRepository.listAll.mockResolvedValue(mockResult);

      // ACT
      const result = await sut.listAll();

      // ASSERT
      expect(result).toEqual(mockResult);
      expect(result).toHaveLength(3);
      expect(result[0]?.abbreviation).toBe("TEN");
      expect(result[1]?.abbreviation).toBe("CAB");
      expect(result[2]?.abbreviation).toBe("SGT");
    });
  });

  describe("error handling", () => {
    it("should propagate repository errors", async () => {
      // ARRANGE
      const { sut, mockMilitaryRankRepository } = makeSut();
      const repositoryError = new Error("Database connection failed");
      mockMilitaryRankRepository.listAll.mockRejectedValue(repositoryError);

      // ACT & ASSERT
      await expect(sut.listAll()).rejects.toThrow("Database connection failed");
      expect(mockMilitaryRankRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should handle repository throwing non-Error objects", async () => {
      // ARRANGE
      const { sut, mockMilitaryRankRepository } = makeSut();
      mockMilitaryRankRepository.listAll.mockRejectedValue("Unknown error");

      // ACT & ASSERT
      await expect(sut.listAll()).rejects.toBe("Unknown error");
    });
  });

  describe("service contract", () => {
    it("should have listAll method", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ASSERT
      expect(sut.listAll).toBeDefined();
      expect(typeof sut.listAll).toBe("function");
    });

    it("should return Promise<MilitaryRank[]>", async () => {
      // ARRANGE
      const { sut, mockMilitaryRankRepository } = makeSut();
      const mockResult: MilitaryRank[] = [];
      mockMilitaryRankRepository.listAll.mockResolvedValue(mockResult);

      // ACT
      const result = sut.listAll();

      // ASSERT
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toEqual(expect.any(Array));
    });

    it("should implement ListAllMilitaryRankUseCase interface", () => {
      // ARRANGE
      const { sut } = makeSut();

      // ASSERT
      expect(sut).toHaveProperty("listAll");
      expect(typeof sut.listAll).toBe("function");
    });
  });
});
