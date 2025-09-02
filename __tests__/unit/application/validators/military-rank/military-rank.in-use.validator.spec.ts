import { MilitaryRankInUseValidator } from "../../../../../src/application/validators";
import { ResourceInUseError } from "../../../../../src/application/errors";
import { MilitaryRepository } from "../../../../../src/domain/repositories";
import { MilitaryOutputDTO } from "../../../../../src/domain/dtos";

const makeMilitaryRepositoryMock = (): jest.Mocked<MilitaryRepository> => ({
  create: jest.fn(),
  delete: jest.fn(),
  findByRg: jest.fn(),
  findById: jest.fn(),
  listAll: jest.fn(),
  update: jest.fn(),
});

describe("MilitaryRankInUseValidator", () => {
  let sut: MilitaryRankInUseValidator;
  let militaryRepository: jest.Mocked<MilitaryRepository>;

  const mockMilitary: MilitaryOutputDTO = {
    id: "military-id",
    militaryRankId: "rank-id",
    militaryRank: {
      id: "rank-id",
      abbreviation: "CEL",
      order: 10,
    },
    rg: 1234,
    name: "João Silva",
  };

  beforeEach(() => {
    militaryRepository = makeMilitaryRepositoryMock();
    sut = new MilitaryRankInUseValidator({
      militaryRepository,
    });
  });

  describe("validate", () => {
    it("should not throw error when military rank is not in use", async () => {
      militaryRepository.listAll.mockResolvedValue([]);

      await expect(sut.validate("rank-id")).resolves.not.toThrow();
      expect(militaryRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should throw ResourceInUseError when military rank is in use", async () => {
      militaryRepository.listAll.mockResolvedValue([mockMilitary]);

      await expect(sut.validate("rank-id")).rejects.toThrow(ResourceInUseError);
      await expect(sut.validate("rank-id")).rejects.toThrow(
        "Posto/Graduação não pode ser excluído(a) pois está sendo utilizado(a) por militares.",
      );
      expect(militaryRepository.listAll).toHaveBeenCalledTimes(2);
    });

    it("should not throw error when military rank is not used by any military", async () => {
      const militaryWithDifferentRank = {
        ...mockMilitary,
        militaryRankId: "different-rank-id",
      };
      militaryRepository.listAll.mockResolvedValue([militaryWithDifferentRank]);

      await expect(sut.validate("rank-id")).resolves.not.toThrow();
      expect(militaryRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should throw error when at least one military uses the rank", async () => {
      const militaryWithDifferentRank = {
        ...mockMilitary,
        id: "military-2",
        militaryRankId: "different-rank-id",
      };
      const militaryWithTargetRank = {
        ...mockMilitary,
        id: "military-3",
        militaryRankId: "rank-id",
      };

      militaryRepository.listAll.mockResolvedValue([
        militaryWithDifferentRank,
        militaryWithTargetRank,
      ]);

      await expect(sut.validate("rank-id")).rejects.toThrow(ResourceInUseError);
      expect(militaryRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple military with same rank", async () => {
      const military1 = { ...mockMilitary, id: "military-1" };
      const military2 = { ...mockMilitary, id: "military-2" };
      const military3 = { ...mockMilitary, id: "military-3" };

      militaryRepository.listAll.mockResolvedValue([
        military1,
        military2,
        military3,
      ]);

      await expect(sut.validate("rank-id")).rejects.toThrow(ResourceInUseError);
      expect(militaryRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should handle empty military list", async () => {
      militaryRepository.listAll.mockResolvedValue([]);

      await expect(sut.validate("any-rank-id")).resolves.not.toThrow();
      expect(militaryRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should handle repository errors", async () => {
      const repositoryError = new Error("Repository error");
      militaryRepository.listAll.mockRejectedValue(repositoryError);

      await expect(sut.validate("rank-id")).rejects.toThrow("Repository error");
      expect(militaryRepository.listAll).toHaveBeenCalledTimes(1);
    });
  });
});
