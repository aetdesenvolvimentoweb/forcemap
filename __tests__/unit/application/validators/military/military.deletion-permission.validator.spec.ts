import { InvalidParamError } from "../../../../../src/application/errors";
import { MilitaryDeletionPermissionValidator } from "../../../../../src/application/validators";
import { UserRole } from "../../../../../src/domain/entities";
import { UserRepository } from "../../../../../src/domain/repositories";

describe("MilitaryDeletionPermissionValidator", () => {
  let sut: MilitaryDeletionPermissionValidator;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findByMilitaryId: jest.fn(),
    } as any;

    sut = new MilitaryDeletionPermissionValidator({
      userRepository: mockUserRepository,
    });
  });

  describe("validate", () => {
    const militaryId = "military-123";

    it("should allow ADMIN to delete any military", async () => {
      const adminUser = {
        id: "user-1",
        military: {
          id: militaryId,
          name: "Test",
          rg: 123,
          militaryRank: { id: "rank-1", abbreviation: "Cel", order: 1 },
        },
        role: UserRole.ADMIN,
      };

      mockUserRepository.findByMilitaryId.mockResolvedValue(adminUser);

      await expect(
        sut.validate(militaryId, UserRole.ADMIN),
      ).resolves.not.toThrow();
    });

    it("should allow CHEFE to delete military with non-admin role", async () => {
      const regularUser = {
        id: "user-1",
        military: {
          id: militaryId,
          name: "Test",
          rg: 123,
          militaryRank: { id: "rank-1", abbreviation: "Sgt", order: 8 },
        },
        role: UserRole.BOMBEIRO,
      };

      mockUserRepository.findByMilitaryId.mockResolvedValue(regularUser);

      await expect(
        sut.validate(militaryId, UserRole.CHEFE),
      ).resolves.not.toThrow();
    });

    it("should prevent CHEFE from deleting military with ADMIN role", async () => {
      const adminUser = {
        id: "user-1",
        military: {
          id: militaryId,
          name: "Test",
          rg: 123,
          militaryRank: { id: "rank-1", abbreviation: "Sgt", order: 8 },
        },
        role: UserRole.ADMIN,
      };

      mockUserRepository.findByMilitaryId.mockResolvedValue(adminUser);

      await expect(sut.validate(militaryId, UserRole.CHEFE)).rejects.toThrow(
        new InvalidParamError(
          "Militar",
          "chefe não pode excluir militar com função de administrador",
        ),
      );
    });

    it("should prevent ACA from deleting any military", async () => {
      const regularUser = {
        id: "user-1",
        military: {
          id: militaryId,
          name: "Test",
          rg: 123,
          militaryRank: { id: "rank-1", abbreviation: "Sgt", order: 8 },
        },
        role: UserRole.BOMBEIRO,
      };

      mockUserRepository.findByMilitaryId.mockResolvedValue(regularUser);

      await expect(sut.validate(militaryId, UserRole.ACA)).rejects.toThrow(
        new InvalidParamError(
          "Militar",
          "usuário não tem permissão para excluir militares",
        ),
      );
    });

    it("should prevent BOMBEIRO from deleting any military", async () => {
      const regularUser = {
        id: "user-1",
        military: {
          id: militaryId,
          name: "Test",
          rg: 123,
          militaryRank: { id: "rank-1", abbreviation: "Sgt", order: 8 },
        },
        role: UserRole.BOMBEIRO,
      };

      mockUserRepository.findByMilitaryId.mockResolvedValue(regularUser);

      await expect(sut.validate(militaryId, UserRole.BOMBEIRO)).rejects.toThrow(
        new InvalidParamError(
          "Militar",
          "usuário não tem permissão para excluir militares",
        ),
      );
    });

    it("should allow deletion when military has no associated user", async () => {
      mockUserRepository.findByMilitaryId.mockResolvedValue(null);

      await expect(
        sut.validate(militaryId, UserRole.CHEFE),
      ).resolves.not.toThrow();

      await expect(
        sut.validate(militaryId, UserRole.ADMIN),
      ).resolves.not.toThrow();
    });
  });
});
