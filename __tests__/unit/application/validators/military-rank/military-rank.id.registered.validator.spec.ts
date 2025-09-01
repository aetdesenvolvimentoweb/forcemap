import { mockMilitaryRankRepository } from "../../../../../__mocks__";
import { EntityNotFoundError } from "../../../../../src/application/errors";
import { MilitaryRankIdRegisteredValidator } from "../../../../../src/application/validators";
import { MilitaryRank } from "../../../../../src/domain/entities";

describe("MilitaryRankIdRegisteredValidator", () => {
  let sut: MilitaryRankIdRegisteredValidator;
  let mockedMilitaryRankRepository = mockMilitaryRankRepository();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new MilitaryRankIdRegisteredValidator({
      militaryRankRepository: mockedMilitaryRankRepository,
    });
  });

  describe("validate", () => {
    it("should not throw when military rank exists", async () => {
      const validId = "550e8400-e29b-41d4-a716-446655440000";
      const existingMilitaryRank: MilitaryRank = {
        id: validId,
        abbreviation: "CEL",
        order: 10,
      };

      mockedMilitaryRankRepository.findById.mockResolvedValueOnce(
        existingMilitaryRank,
      );

      await expect(sut.validate(validId)).resolves.not.toThrow();
    });

    it("should call repository.findById with correct id", async () => {
      const validId = "550e8400-e29b-41d4-a716-446655440000";
      const existingMilitaryRank: MilitaryRank = {
        id: validId,
        abbreviation: "CEL",
        order: 10,
      };

      mockedMilitaryRankRepository.findById.mockResolvedValueOnce(
        existingMilitaryRank,
      );

      await sut.validate(validId);

      expect(mockedMilitaryRankRepository.findById).toHaveBeenCalledWith(
        validId,
      );
      expect(mockedMilitaryRankRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should throw EntityNotFoundError when military rank does not exist", async () => {
      const nonExistentId = "550e8400-e29b-41d4-a716-446655440001";

      mockedMilitaryRankRepository.findById.mockResolvedValueOnce(null);

      await expect(sut.validate(nonExistentId)).rejects.toThrow(
        new EntityNotFoundError("Posto/Graduação"),
      );
    });

    it("should call repository.findById only once when entity not found", async () => {
      const nonExistentId = "550e8400-e29b-41d4-a716-446655440001";

      mockedMilitaryRankRepository.findById.mockResolvedValueOnce(null);

      try {
        await sut.validate(nonExistentId);
      } catch {
        // Expected to throw
      }

      expect(mockedMilitaryRankRepository.findById).toHaveBeenCalledWith(
        nonExistentId,
      );
      expect(mockedMilitaryRankRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should handle repository returning undefined", async () => {
      const validId = "550e8400-e29b-41d4-a716-446655440000";

      mockedMilitaryRankRepository.findById.mockResolvedValueOnce(
        undefined as any,
      );

      await expect(sut.validate(validId)).rejects.toThrow(
        new EntityNotFoundError("Posto/Graduação"),
      );
    });

    it("should handle empty string id", async () => {
      const emptyId = "";

      mockedMilitaryRankRepository.findById.mockResolvedValueOnce(null);

      await expect(sut.validate(emptyId)).rejects.toThrow(
        new EntityNotFoundError("Posto/Graduação"),
      );

      expect(mockedMilitaryRankRepository.findById).toHaveBeenCalledWith(
        emptyId,
      );
    });

    it("should handle malformed UUID", async () => {
      const malformedId = "not-a-uuid";

      mockedMilitaryRankRepository.findById.mockResolvedValueOnce(null);

      await expect(sut.validate(malformedId)).rejects.toThrow(
        new EntityNotFoundError("Posto/Graduação"),
      );

      expect(mockedMilitaryRankRepository.findById).toHaveBeenCalledWith(
        malformedId,
      );
    });

    it("should propagate repository errors", async () => {
      const validId = "550e8400-e29b-41d4-a716-446655440000";
      const repositoryError = new Error("Database connection failed");

      mockedMilitaryRankRepository.findById.mockRejectedValueOnce(
        repositoryError,
      );

      await expect(sut.validate(validId)).rejects.toThrow(repositoryError);
    });

    it("should validate different existing military ranks", async () => {
      const militaryRanks: MilitaryRank[] = [
        { id: "id-1", abbreviation: "CEL", order: 10 },
        { id: "id-2", abbreviation: "MAJ", order: 8 },
        { id: "id-3", abbreviation: "CAP", order: 6 },
      ];

      for (const militaryRank of militaryRanks) {
        mockedMilitaryRankRepository.findById.mockResolvedValueOnce(
          militaryRank,
        );
        await expect(sut.validate(militaryRank.id)).resolves.not.toThrow();
      }

      expect(mockedMilitaryRankRepository.findById).toHaveBeenCalledTimes(3);
    });

    it("should work with zero order military rank", async () => {
      const militaryRank: MilitaryRank = {
        id: "id-zero",
        abbreviation: "REC",
        order: 0,
      };

      mockedMilitaryRankRepository.findById.mockResolvedValueOnce(militaryRank);

      await expect(sut.validate(militaryRank.id)).resolves.not.toThrow();
    });

    it("should work with military rank having special characters in abbreviation", async () => {
      const militaryRank: MilitaryRank = {
        id: "id-special",
        abbreviation: "1º SGT",
        order: 5,
      };

      mockedMilitaryRankRepository.findById.mockResolvedValueOnce(militaryRank);

      await expect(sut.validate(militaryRank.id)).resolves.not.toThrow();
    });
  });
});
