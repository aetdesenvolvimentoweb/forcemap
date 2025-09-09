import { mockUserRepository } from "../../../../../__mocks__";
import { ResourceInUseError } from "../../../../../src/application/errors";
import { MilitaryInUseValidator } from "../../../../../src/application/validators";
import { UserOutputDTO } from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";
import { UserRepository } from "../../../../../src/domain/repositories";

describe("MilitaryInUseValidator", () => {
  let sut: MilitaryInUseValidator;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUser: UserOutputDTO = {
    id: "user-id",
    role: UserRole.ADMIN,
    military: {
      id: "military-id",
      militaryRank: {
        id: "rank-id",
        abbreviation: "CEL",
        order: 10,
      },
      rg: 1234,
      name: "João Silva",
    },
  };

  beforeEach(() => {
    userRepository = mockUserRepository();
    sut = new MilitaryInUseValidator({
      userRepository,
    });
  });

  describe("validate", () => {
    it("should not throw error when military is not in use", async () => {
      userRepository.listAll.mockResolvedValue([]);

      await expect(sut.validate("military-id")).resolves.not.toThrow();
      expect(userRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should throw ResourceInUseError when military is in use", async () => {
      userRepository.listAll.mockResolvedValue([mockUser]);

      await expect(sut.validate("military-id")).rejects.toThrow(
        ResourceInUseError,
      );
      await expect(sut.validate("military-id")).rejects.toThrow(
        "Militar não pode ser excluído(a) pois está sendo utilizado(a) por usuários.",
      );
      expect(userRepository.listAll).toHaveBeenCalledTimes(2);
    });

    it("should not throw error when military is not used by any user", async () => {
      const userWithDifferentMilitary = {
        ...mockUser,
        military: {
          ...mockUser.military,
          id: "different-military-id",
        },
      };
      userRepository.listAll.mockResolvedValue([userWithDifferentMilitary]);

      await expect(sut.validate("military-id")).resolves.not.toThrow();
      expect(userRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should throw error when at least one user uses the military", async () => {
      const userWithDifferentMilitary = {
        ...mockUser,
        id: "user-2",
        military: {
          ...mockUser.military,
          id: "different-military-id",
        },
      };
      const userWithTargetMilitary = {
        ...mockUser,
        id: "user-3",
        military: {
          ...mockUser.military,
          id: "military-id",
        },
      };

      userRepository.listAll.mockResolvedValue([
        userWithDifferentMilitary,
        userWithTargetMilitary,
      ]);

      await expect(sut.validate("military-id")).rejects.toThrow(
        ResourceInUseError,
      );
      expect(userRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple users with same military", async () => {
      const user1 = { ...mockUser, id: "user-1" };
      const user2 = { ...mockUser, id: "user-2" };
      const user3 = { ...mockUser, id: "user-3" };

      userRepository.listAll.mockResolvedValue([user1, user2, user3]);

      await expect(sut.validate("military-id")).rejects.toThrow(
        ResourceInUseError,
      );
      expect(userRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should handle empty user list", async () => {
      userRepository.listAll.mockResolvedValue([]);

      await expect(sut.validate("any-military-id")).resolves.not.toThrow();
      expect(userRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should handle repository errors", async () => {
      const repositoryError = new Error("Repository error");
      userRepository.listAll.mockRejectedValue(repositoryError);

      await expect(sut.validate("military-id")).rejects.toThrow(
        "Repository error",
      );
      expect(userRepository.listAll).toHaveBeenCalledTimes(1);
    });
  });
});
