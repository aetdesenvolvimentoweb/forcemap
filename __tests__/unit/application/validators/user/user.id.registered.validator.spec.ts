import { mockUserRepository } from "../../../../../__mocks__/repositories";
import { EntityNotFoundError } from "../../../../../src/application/errors";
import { UserIdRegisteredValidator } from "../../../../../src/application/validators";
import { UserOutputDTO } from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";
import { UserRepository } from "../../../../../src/domain/repositories";

describe("UserIdRegisteredValidator", () => {
  let sut: UserIdRegisteredValidator;
  let mockedUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockedUserRepository = mockUserRepository();

    sut = new UserIdRegisteredValidator({
      userRepository: mockedUserRepository,
    });
  });

  describe("constructor", () => {
    it("should create instance with user repository dependency", () => {
      expect(sut).toBeInstanceOf(UserIdRegisteredValidator);
      expect(sut.validate).toBeDefined();
    });
  });

  describe("validate", () => {
    const validId = "123e4567-e89b-12d3-a456-426614174000";

    it("should not throw when user exists", async () => {
      const existingUser: UserOutputDTO = {
        id: validId,
        role: UserRole.ADMIN,
        military: {
          id: "military-id",
          name: "João Silva",
          rg: 1234,
          militaryRankId: "rank-id",
          militaryRank: {
            id: "rank-id",
            abbreviation: "SGT",
            order: 5,
          },
        },
      };

      mockedUserRepository.findById.mockResolvedValue(existingUser);

      await expect(sut.validate(validId)).resolves.not.toThrow();
      expect(mockedUserRepository.findById).toHaveBeenCalledWith(validId);
      expect(mockedUserRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should throw EntityNotFoundError when user does not exist", async () => {
      const nonExistentId = "non-existent-id";
      mockedUserRepository.findById.mockResolvedValue(null);

      await expect(sut.validate(nonExistentId)).rejects.toThrow(
        EntityNotFoundError,
      );
      await expect(sut.validate(nonExistentId)).rejects.toThrow(
        "Usuário não encontrado(a) com esse ID.",
      );

      expect(mockedUserRepository.findById).toHaveBeenCalledWith(nonExistentId);
      expect(mockedUserRepository.findById).toHaveBeenCalledTimes(2);
    });

    it("should throw EntityNotFoundError when repository returns undefined", async () => {
      mockedUserRepository.findById.mockResolvedValue(undefined as any);

      await expect(sut.validate(validId)).rejects.toThrow(EntityNotFoundError);
      expect(mockedUserRepository.findById).toHaveBeenCalledWith(validId);
    });

    it("should call repository findById with correct id parameter", async () => {
      const testId = "test-user-id";
      mockedUserRepository.findById.mockResolvedValue({
        id: testId,
        role: UserRole.BOMBEIRO,
        military: {
          id: "military-id",
          name: "Test User",
          rg: 9999,
          militaryRankId: "rank-id",
          militaryRank: {
            id: "rank-id",
            abbreviation: "SD",
            order: 1,
          },
        },
      });

      await sut.validate(testId);

      expect(mockedUserRepository.findById).toHaveBeenCalledWith(testId);
      expect(mockedUserRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should handle repository error", async () => {
      const repositoryError = new Error("Database connection failed");
      mockedUserRepository.findById.mockRejectedValue(repositoryError);

      await expect(sut.validate(validId)).rejects.toThrow(repositoryError);
      expect(mockedUserRepository.findById).toHaveBeenCalledWith(validId);
    });

    it("should validate different user IDs independently", async () => {
      const id1 = "user-1";
      const id2 = "user-2";
      const id3 = "user-3";

      const user1: UserOutputDTO = {
        id: id1,
        role: UserRole.ADMIN,
        military: {
          id: "military-1",
          name: "User 1",
          rg: 1111,
          militaryRankId: "rank-1",
          militaryRank: {
            id: "rank-1",
            abbreviation: "TEN",
            order: 7,
          },
        },
      };

      const user2: UserOutputDTO = {
        id: id2,
        role: UserRole.BOMBEIRO,
        military: {
          id: "military-2",
          name: "User 2",
          rg: 2222,
          militaryRankId: "rank-2",
          militaryRank: {
            id: "rank-2",
            abbreviation: "CAB",
            order: 2,
          },
        },
      };

      mockedUserRepository.findById
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2)
        .mockResolvedValueOnce(null);

      await expect(sut.validate(id1)).resolves.not.toThrow();
      await expect(sut.validate(id2)).resolves.not.toThrow();
      await expect(sut.validate(id3)).rejects.toThrow(EntityNotFoundError);

      expect(mockedUserRepository.findById).toHaveBeenNthCalledWith(1, id1);
      expect(mockedUserRepository.findById).toHaveBeenNthCalledWith(2, id2);
      expect(mockedUserRepository.findById).toHaveBeenNthCalledWith(3, id3);
      expect(mockedUserRepository.findById).toHaveBeenCalledTimes(3);
    });

    it("should handle empty string ID", async () => {
      const emptyId = "";
      mockedUserRepository.findById.mockResolvedValue(null);

      await expect(sut.validate(emptyId)).rejects.toThrow(EntityNotFoundError);
      expect(mockedUserRepository.findById).toHaveBeenCalledWith(emptyId);
    });

    it("should handle whitespace-only ID", async () => {
      const whitespaceId = "   ";
      mockedUserRepository.findById.mockResolvedValue(null);

      await expect(sut.validate(whitespaceId)).rejects.toThrow(
        EntityNotFoundError,
      );
      expect(mockedUserRepository.findById).toHaveBeenCalledWith(whitespaceId);
    });

    it("should handle special characters in ID", async () => {
      const specialId = "user@#$%^&*()";
      mockedUserRepository.findById.mockResolvedValue(null);

      await expect(sut.validate(specialId)).rejects.toThrow(
        EntityNotFoundError,
      );
      expect(mockedUserRepository.findById).toHaveBeenCalledWith(specialId);
    });

    it("should validate same ID multiple times", async () => {
      const testId = "repeated-id";
      const user: UserOutputDTO = {
        id: testId,
        role: UserRole.ADMIN,
        military: {
          id: "military-repeated",
          name: "Repeated User",
          rg: 5555,
          militaryRankId: "rank-id",
          militaryRank: {
            id: "rank-id",
            abbreviation: "MAJ",
            order: 8,
          },
        },
      };

      mockedUserRepository.findById.mockResolvedValue(user);

      await expect(sut.validate(testId)).resolves.not.toThrow();
      await expect(sut.validate(testId)).resolves.not.toThrow();
      await expect(sut.validate(testId)).resolves.not.toThrow();

      expect(mockedUserRepository.findById).toHaveBeenCalledTimes(3);
      expect(mockedUserRepository.findById).toHaveBeenCalledWith(testId);
    });

    it("should handle null ID parameter", async () => {
      mockedUserRepository.findById.mockResolvedValue(null);

      await expect(sut.validate(null as any)).rejects.toThrow(
        EntityNotFoundError,
      );
      expect(mockedUserRepository.findById).toHaveBeenCalledWith(null);
    });

    it("should handle undefined ID parameter", async () => {
      mockedUserRepository.findById.mockResolvedValue(null);

      await expect(sut.validate(undefined as any)).rejects.toThrow(
        EntityNotFoundError,
      );
      expect(mockedUserRepository.findById).toHaveBeenCalledWith(undefined);
    });

    it("should preserve user object structure from repository", async () => {
      const complexUser: UserOutputDTO = {
        id: validId,
        role: UserRole.ADMIN,
        military: {
          id: "complex-military-id",
          name: "Complex User Name",
          rg: 7777,
          militaryRankId: "complex-rank-id",
          militaryRank: {
            id: "complex-rank-id",
            abbreviation: "CEL",
            order: 10,
          },
        },
      };

      mockedUserRepository.findById.mockResolvedValue(complexUser);

      await expect(sut.validate(validId)).resolves.not.toThrow();

      const repositoryCall = mockedUserRepository.findById.mock.calls[0];
      expect(repositoryCall[0]).toBe(validId);
    });

    it("should validate asynchronously", async () => {
      const asyncUser: UserOutputDTO = {
        id: validId,
        role: UserRole.BOMBEIRO,
        military: {
          id: "async-military",
          name: "Async User",
          rg: 8888,
          militaryRankId: "async-rank",
          militaryRank: {
            id: "async-rank",
            abbreviation: "ASP",
            order: 3,
          },
        },
      };

      let resolvePromise: (value: UserOutputDTO) => void;
      const delayedPromise = new Promise<UserOutputDTO>((resolve) => {
        resolvePromise = resolve;
      });

      mockedUserRepository.findById.mockReturnValue(delayedPromise);

      const validationPromise = sut.validate(validId);

      // Validation should not complete immediately
      let isResolved = false;
      validationPromise.then(() => {
        isResolved = true;
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(isResolved).toBe(false);

      // Now resolve the repository promise
      resolvePromise!(asyncUser);

      await expect(validationPromise).resolves.not.toThrow();
      expect(mockedUserRepository.findById).toHaveBeenCalledWith(validId);
    });

    it("should check correct error properties", async () => {
      mockedUserRepository.findById.mockResolvedValue(null);

      try {
        await sut.validate("non-existent-id");
        fail("Should have thrown EntityNotFoundError");
      } catch (error) {
        expect(error).toBeInstanceOf(EntityNotFoundError);
        expect((error as EntityNotFoundError).message).toBe(
          "Usuário não encontrado(a) com esse ID.",
        );
        expect((error as EntityNotFoundError).statusCode).toBe(404);
        expect((error as EntityNotFoundError).name).toBe("EntityNotFoundError");
      }
    });

    it("should validate users with different roles", async () => {
      for (const role of Object.values(UserRole)) {
        const userId = `user-${role}`;
        const user: UserOutputDTO = {
          id: userId,
          role,
          military: {
            id: `military-${role}`,
            name: `User ${role}`,
            rg: 1000 + Object.keys(UserRole).indexOf(role),
            militaryRankId: `rank-${role}`,
            militaryRank: {
              id: `rank-${role}`,
              abbreviation: "TEST",
              order: 1,
            },
          },
        };

        mockedUserRepository.findById.mockResolvedValueOnce(user);

        await expect(sut.validate(userId)).resolves.not.toThrow();
      }

      expect(mockedUserRepository.findById).toHaveBeenCalledTimes(
        Object.values(UserRole).length,
      );
    });
  });
});
