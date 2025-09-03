import { mockMilitaryRepository } from "../../../../../__mocks__/repositories";
import { EntityNotFoundError } from "../../../../../src/application/errors";
import { MilitaryIdRegisteredValidator } from "../../../../../src/application/validators";
import { MilitaryOutputDTO } from "../../../../../src/domain/dtos";
import { MilitaryRank } from "../../../../../src/domain/entities";
import { MilitaryRepository } from "../../../../../src/domain/repositories";

describe("MilitaryIdRegisteredValidator", () => {
  let sut: MilitaryIdRegisteredValidator;
  let mockedMilitaryRepository: jest.Mocked<MilitaryRepository>;

  beforeEach(() => {
    mockedMilitaryRepository = mockMilitaryRepository();

    sut = new MilitaryIdRegisteredValidator({
      militaryRepository: mockedMilitaryRepository,
    });
  });

  describe("constructor", () => {
    it("should create instance with military repository dependency", () => {
      expect(sut).toBeInstanceOf(MilitaryIdRegisteredValidator);
      expect(sut.validate).toBeDefined();
    });
  });

  describe("validate", () => {
    const validId = "123e4567-e89b-12d3-a456-426614174000";

    it("should not throw when military exists", async () => {
      const existingMilitary: MilitaryOutputDTO = {
        id: validId,
        name: "João Silva",
        rg: 1234,
        militaryRankId: "rank-id",
        militaryRank: {
          id: "rank-id",
          abbreviation: "SGT",
          name: "Sargento",
          order: 5,
        } as MilitaryRank,
      };

      mockedMilitaryRepository.findById.mockResolvedValue(existingMilitary);

      await expect(sut.validate(validId)).resolves.not.toThrow();
      expect(mockedMilitaryRepository.findById).toHaveBeenCalledWith(validId);
      expect(mockedMilitaryRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should throw EntityNotFoundError when military does not exist", async () => {
      const nonExistentId = "non-existent-id";
      mockedMilitaryRepository.findById.mockResolvedValue(null);

      await expect(sut.validate(nonExistentId)).rejects.toThrow(
        EntityNotFoundError,
      );
      await expect(sut.validate(nonExistentId)).rejects.toThrow(
        "Militar não encontrado(a) com esse ID.",
      );

      expect(mockedMilitaryRepository.findById).toHaveBeenCalledWith(
        nonExistentId,
      );
      expect(mockedMilitaryRepository.findById).toHaveBeenCalledTimes(2);
    });

    it("should throw EntityNotFoundError when repository returns undefined", async () => {
      mockedMilitaryRepository.findById.mockResolvedValue(undefined as any);

      await expect(sut.validate(validId)).rejects.toThrow(EntityNotFoundError);
      expect(mockedMilitaryRepository.findById).toHaveBeenCalledWith(validId);
    });

    it("should call repository findById with correct id parameter", async () => {
      const testId = "test-military-id";
      mockedMilitaryRepository.findById.mockResolvedValue({
        id: testId,
        name: "Test Military",
        rg: 9999,
        militaryRankId: "rank-id",
        militaryRank: {} as MilitaryRank,
      });

      await sut.validate(testId);

      expect(mockedMilitaryRepository.findById).toHaveBeenCalledWith(testId);
      expect(mockedMilitaryRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should handle repository error", async () => {
      const repositoryError = new Error("Database connection failed");
      mockedMilitaryRepository.findById.mockRejectedValue(repositoryError);

      await expect(sut.validate(validId)).rejects.toThrow(repositoryError);
      expect(mockedMilitaryRepository.findById).toHaveBeenCalledWith(validId);
    });

    it("should validate different military IDs independently", async () => {
      const id1 = "military-1";
      const id2 = "military-2";
      const id3 = "military-3";

      const military1: MilitaryOutputDTO = {
        id: id1,
        name: "Military 1",
        rg: 1111,
        militaryRankId: "rank-1",
        militaryRank: {} as MilitaryRank,
      };

      const military2: MilitaryOutputDTO = {
        id: id2,
        name: "Military 2",
        rg: 2222,
        militaryRankId: "rank-2",
        militaryRank: {} as MilitaryRank,
      };

      mockedMilitaryRepository.findById
        .mockResolvedValueOnce(military1)
        .mockResolvedValueOnce(military2)
        .mockResolvedValueOnce(null);

      await expect(sut.validate(id1)).resolves.not.toThrow();
      await expect(sut.validate(id2)).resolves.not.toThrow();
      await expect(sut.validate(id3)).rejects.toThrow(EntityNotFoundError);

      expect(mockedMilitaryRepository.findById).toHaveBeenNthCalledWith(1, id1);
      expect(mockedMilitaryRepository.findById).toHaveBeenNthCalledWith(2, id2);
      expect(mockedMilitaryRepository.findById).toHaveBeenNthCalledWith(3, id3);
      expect(mockedMilitaryRepository.findById).toHaveBeenCalledTimes(3);
    });

    it("should handle empty string ID", async () => {
      const emptyId = "";
      mockedMilitaryRepository.findById.mockResolvedValue(null);

      await expect(sut.validate(emptyId)).rejects.toThrow(EntityNotFoundError);
      expect(mockedMilitaryRepository.findById).toHaveBeenCalledWith(emptyId);
    });

    it("should handle whitespace-only ID", async () => {
      const whitespaceId = "   ";
      mockedMilitaryRepository.findById.mockResolvedValue(null);

      await expect(sut.validate(whitespaceId)).rejects.toThrow(
        EntityNotFoundError,
      );
      expect(mockedMilitaryRepository.findById).toHaveBeenCalledWith(
        whitespaceId,
      );
    });

    it("should handle special characters in ID", async () => {
      const specialId = "military@#$%^&*()";
      mockedMilitaryRepository.findById.mockResolvedValue(null);

      await expect(sut.validate(specialId)).rejects.toThrow(
        EntityNotFoundError,
      );
      expect(mockedMilitaryRepository.findById).toHaveBeenCalledWith(specialId);
    });

    it("should validate same ID multiple times", async () => {
      const testId = "repeated-id";
      const military: MilitaryOutputDTO = {
        id: testId,
        name: "Repeated Military",
        rg: 5555,
        militaryRankId: "rank-id",
        militaryRank: {} as MilitaryRank,
      };

      mockedMilitaryRepository.findById.mockResolvedValue(military);

      await expect(sut.validate(testId)).resolves.not.toThrow();
      await expect(sut.validate(testId)).resolves.not.toThrow();
      await expect(sut.validate(testId)).resolves.not.toThrow();

      expect(mockedMilitaryRepository.findById).toHaveBeenCalledTimes(3);
      expect(mockedMilitaryRepository.findById).toHaveBeenCalledWith(testId);
    });

    it("should handle null ID parameter", async () => {
      mockedMilitaryRepository.findById.mockResolvedValue(null);

      await expect(sut.validate(null as any)).rejects.toThrow(
        EntityNotFoundError,
      );
      expect(mockedMilitaryRepository.findById).toHaveBeenCalledWith(null);
    });

    it("should handle undefined ID parameter", async () => {
      mockedMilitaryRepository.findById.mockResolvedValue(null);

      await expect(sut.validate(undefined as any)).rejects.toThrow(
        EntityNotFoundError,
      );
      expect(mockedMilitaryRepository.findById).toHaveBeenCalledWith(undefined);
    });

    it("should preserve military object structure from repository", async () => {
      const complexMilitary: MilitaryOutputDTO = {
        id: validId,
        name: "Complex Military Name",
        rg: 7777,
        militaryRankId: "complex-rank-id",
        militaryRank: {
          id: "complex-rank-id",
          abbreviation: "MAJ",
          name: "Major",
          order: 8,
        } as MilitaryRank,
      };

      mockedMilitaryRepository.findById.mockResolvedValue(complexMilitary);

      await expect(sut.validate(validId)).resolves.not.toThrow();

      const repositoryCall = mockedMilitaryRepository.findById.mock.calls[0];
      expect(repositoryCall[0]).toBe(validId);
    });

    it("should validate asynchronously", async () => {
      const asyncMilitary: MilitaryOutputDTO = {
        id: validId,
        name: "Async Military",
        rg: 8888,
        militaryRankId: "async-rank",
        militaryRank: {} as MilitaryRank,
      };

      let resolvePromise: (value: MilitaryOutputDTO) => void;
      const delayedPromise = new Promise<MilitaryOutputDTO>((resolve) => {
        resolvePromise = resolve;
      });

      mockedMilitaryRepository.findById.mockReturnValue(delayedPromise);

      const validationPromise = sut.validate(validId);

      // Validation should not complete immediately
      let isResolved = false;
      validationPromise.then(() => {
        isResolved = true;
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(isResolved).toBe(false);

      // Now resolve the repository promise
      resolvePromise!(asyncMilitary);

      await expect(validationPromise).resolves.not.toThrow();
      expect(mockedMilitaryRepository.findById).toHaveBeenCalledWith(validId);
    });

    it("should check correct error properties", async () => {
      mockedMilitaryRepository.findById.mockResolvedValue(null);

      try {
        await sut.validate("non-existent-id");
        fail("Should have thrown EntityNotFoundError");
      } catch (error) {
        expect(error).toBeInstanceOf(EntityNotFoundError);
        expect((error as EntityNotFoundError).message).toBe(
          "Militar não encontrado(a) com esse ID.",
        );
        expect((error as EntityNotFoundError).statusCode).toBe(404);
        expect((error as EntityNotFoundError).name).toBe("EntityNotFoundError");
      }
    });
  });
});
