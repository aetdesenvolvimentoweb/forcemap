import { mockMilitaryRepository } from "../../../../../__mocks__/repositories/military.repository.mock";
import { EntityNotFoundError } from "../../../../../src/application/errors";
import { UserInputDTO } from "../../../../../src/domain/dtos";
import {
  Military,
  MilitaryRank,
  UserRole,
} from "../../../../../src/domain/entities";
import { MilitaryRepository } from "../../../../../src/domain/repositories";
import { UserRepositoryInMemory } from "../../../../../src/infra/repositories/in-memory";

describe("UserRepositoryInMemory", () => {
  let sut: UserRepositoryInMemory;
  let militaryRepository: jest.Mocked<MilitaryRepository>;

  const mockMilitaryRank: MilitaryRank = {
    id: "rank-id",
    abbreviation: "CEL",
    order: 10,
  };

  const mockMilitary: Military = {
    id: "military-id",
    militaryRankId: "rank-id",
    rg: 123456,
    name: "João Silva",
  };

  beforeEach(() => {
    militaryRepository = mockMilitaryRepository();
    sut = new UserRepositoryInMemory(militaryRepository);
  });

  describe("create", () => {
    const inputData: UserInputDTO = {
      militaryId: "military-id",
      role: UserRole.BOMBEIRO,
      password: "hashedPassword123",
    };

    beforeEach(() => {
      militaryRepository.findById.mockResolvedValue({
        ...mockMilitary,
        militaryRank: mockMilitaryRank,
      });
    });

    it("should create user successfully", async () => {
      await sut.create(inputData);

      const result = await sut.listAll();
      expect(result).toHaveLength(1);
    });

    it("should generate unique UUID for each user", async () => {
      await sut.create(inputData);
      await sut.create({
        ...inputData,
        militaryId: "military-id-2",
        role: UserRole.ADMIN,
      });

      const result = await sut.listAll();
      expect(result).toHaveLength(2);
      expect(result[0].id).not.toBe(result[1].id);
      expect(result[0].id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(result[1].id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it("should create multiple users", async () => {
      const mockMilitary2: Military = {
        id: "military-id-2",
        militaryRankId: "rank-id",
        rg: 654321,
        name: "Maria Santos",
      };

      const mockMilitary3: Military = {
        id: "military-id-3",
        militaryRankId: "rank-id",
        rg: 789012,
        name: "José Costa",
      };

      militaryRepository.findById.mockImplementation((id) => {
        if (id === "military-id")
          return Promise.resolve({
            ...mockMilitary,
            militaryRank: mockMilitaryRank,
          });
        if (id === "military-id-2")
          return Promise.resolve({
            ...mockMilitary2,
            militaryRank: mockMilitaryRank,
          });
        if (id === "military-id-3")
          return Promise.resolve({
            ...mockMilitary3,
            militaryRank: mockMilitaryRank,
          });
        return Promise.resolve(null);
      });

      await sut.create({
        militaryId: "military-id",
        role: UserRole.ADMIN,
        password: "pass1",
      });
      await sut.create({
        militaryId: "military-id-2",
        role: UserRole.CHEFE,
        password: "pass2",
      });
      await sut.create({
        militaryId: "military-id-3",
        role: UserRole.BOMBEIRO,
        password: "pass3",
      });

      const result = await sut.listAll();
      expect(result).toHaveLength(3);
    });
  });

  describe("delete", () => {
    beforeEach(async () => {
      militaryRepository.findById.mockResolvedValue({
        ...mockMilitary,
        militaryRank: mockMilitaryRank,
      });
    });

    it("should delete existing user", async () => {
      await sut.create({
        militaryId: "military-id",
        role: UserRole.BOMBEIRO,
        password: "hashedPassword",
      });
      const beforeDelete = await sut.listAll();
      const userId = beforeDelete[0].id;

      await sut.delete(userId);

      const afterDelete = await sut.listAll();
      expect(afterDelete).toHaveLength(0);
    });

    it("should not affect other users when deleting", async () => {
      const mockMilitary2: Military = {
        id: "military-id-2",
        militaryRankId: "rank-id",
        rg: 654321,
        name: "Maria Santos",
      };

      militaryRepository.findById.mockImplementation((id) => {
        if (id === "military-id")
          return Promise.resolve({
            ...mockMilitary,
            militaryRank: mockMilitaryRank,
          });
        if (id === "military-id-2")
          return Promise.resolve({
            ...mockMilitary2,
            militaryRank: mockMilitaryRank,
          });
        return Promise.resolve(null);
      });

      await sut.create({
        militaryId: "military-id",
        role: UserRole.ADMIN,
        password: "pass1",
      });
      await sut.create({
        militaryId: "military-id-2",
        role: UserRole.BOMBEIRO,
        password: "pass2",
      });

      const allItems = await sut.listAll();
      const userToDelete = allItems[0].id;

      await sut.delete(userToDelete);

      const remainingItems = await sut.listAll();
      expect(remainingItems).toHaveLength(1);
      expect(
        remainingItems.find((item) => item.id === userToDelete),
      ).toBeUndefined();
    });

    it("should handle deletion of non-existent id gracefully", async () => {
      await sut.create({
        militaryId: "military-id",
        role: UserRole.BOMBEIRO,
        password: "hashedPassword",
      });
      const nonExistentId = "non-existent-id";

      await sut.delete(nonExistentId);

      const result = await sut.listAll();
      expect(result).toHaveLength(1);
    });

    it("should handle deletion from empty repository", async () => {
      const nonExistentId = "non-existent-id";

      await sut.delete(nonExistentId);

      const result = await sut.listAll();
      expect(result).toHaveLength(0);
    });
  });

  describe("findByMilitaryId", () => {
    beforeEach(async () => {
      militaryRepository.findById.mockResolvedValue({
        ...mockMilitary,
        militaryRank: mockMilitaryRank,
      });
      await sut.create({
        militaryId: "military-id",
        role: UserRole.BOMBEIRO,
        password: "hashedPassword",
      });
    });

    it("should find user by military id", async () => {
      const result = await sut.findByMilitaryId("military-id");

      expect(result).not.toBeNull();
      expect(result?.military.id).toBe("military-id");
      expect(result?.role).toBe(UserRole.BOMBEIRO);
      expect(result?.military).toEqual({
        ...mockMilitary,
        militaryRank: mockMilitaryRank,
      });
      expect(militaryRepository.findById).toHaveBeenCalledWith("military-id");
    });

    it("should return null when military id not found", async () => {
      const result = await sut.findByMilitaryId("non-existent-military-id");

      expect(result).toBeNull();
    });

    it("should throw EntityNotFoundError when military not found", async () => {
      militaryRepository.findById.mockResolvedValue(null);

      await expect(sut.findByMilitaryId("military-id")).rejects.toThrow(
        EntityNotFoundError,
      );
      await expect(sut.findByMilitaryId("military-id")).rejects.toThrow(
        "Militar",
      );
    });
  });

  describe("findByMilitaryIdWithPassword", () => {
    beforeEach(async () => {
      militaryRepository.findById.mockResolvedValue({
        ...mockMilitary,
        militaryRank: mockMilitaryRank,
      });
      await sut.create({
        militaryId: "military-id",
        role: UserRole.BOMBEIRO,
        password: "hashedPassword123",
      });
    });

    it("should find user by military id with password", async () => {
      const result = await sut.findByMilitaryIdWithPassword("military-id");

      expect(result).not.toBeNull();
      expect(result?.militaryId).toBe("military-id");
      expect(result?.role).toBe(UserRole.BOMBEIRO);
      expect(result?.password).toBe("hashedPassword123");
    });

    it("should return null when military id not found", async () => {
      const result = await sut.findByMilitaryIdWithPassword(
        "non-existent-military-id",
      );

      expect(result).toBeNull();
    });

    it("should return raw User entity with password", async () => {
      const result = await sut.findByMilitaryIdWithPassword("military-id");

      expect(result).toEqual({
        id: expect.any(String),
        militaryId: "military-id",
        role: UserRole.BOMBEIRO,
        password: "hashedPassword123",
      });
    });
  });

  describe("findById", () => {
    let userId: string;

    beforeEach(async () => {
      militaryRepository.findById.mockResolvedValue({
        ...mockMilitary,
        militaryRank: mockMilitaryRank,
      });
      await sut.create({
        militaryId: "military-id",
        role: UserRole.BOMBEIRO,
        password: "hashedPassword",
      });
      const items = await sut.listAll();
      userId = items[0].id;
    });

    it("should find user by id", async () => {
      const result = await sut.findById(userId);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(userId);
      expect(result?.military.id).toBe("military-id");
      expect(result?.role).toBe(UserRole.BOMBEIRO);
      expect(result?.military).toEqual({
        ...mockMilitary,
        militaryRank: mockMilitaryRank,
      });
    });

    it("should return null when id not found", async () => {
      const result = await sut.findById("non-existent-id");

      expect(result).toBeNull();
    });

    it("should throw EntityNotFoundError when military not found", async () => {
      militaryRepository.findById.mockResolvedValue(null);

      await expect(sut.findById(userId)).rejects.toThrow(EntityNotFoundError);
      await expect(sut.findById(userId)).rejects.toThrow("Militar");
    });

    it("should return null for empty string id", async () => {
      const result = await sut.findById("");

      expect(result).toBeNull();
    });
  });

  describe("listAll", () => {
    it("should return empty array when no users exist", async () => {
      const result = await sut.listAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should return all users with mapped military data", async () => {
      const mockMilitary2: Military = {
        id: "military-id-2",
        militaryRankId: "rank-id",
        rg: 654321,
        name: "Maria Santos",
      };

      militaryRepository.findById.mockImplementation((id) => {
        if (id === "military-id")
          return Promise.resolve({
            ...mockMilitary,
            militaryRank: mockMilitaryRank,
          });
        if (id === "military-id-2")
          return Promise.resolve({
            ...mockMilitary2,
            militaryRank: mockMilitaryRank,
          });
        return Promise.resolve(null);
      });

      await sut.create({
        militaryId: "military-id",
        role: UserRole.ADMIN,
        password: "pass1",
      });
      await sut.create({
        militaryId: "military-id-2",
        role: UserRole.BOMBEIRO,
        password: "pass2",
      });

      const result = await sut.listAll();

      expect(result).toHaveLength(2);
      expect(result[0].military).toEqual({
        ...mockMilitary,
        militaryRank: mockMilitaryRank,
      });
      expect(result[1].military).toEqual({
        ...mockMilitary2,
        militaryRank: mockMilitaryRank,
      });
      expect(militaryRepository.findById).toHaveBeenCalledTimes(2);
    });

    it("should return users in insertion order", async () => {
      const mockMilitary2: Military = {
        id: "military-id-2",
        militaryRankId: "rank-id",
        rg: 654321,
        name: "Maria Santos",
      };

      const mockMilitary3: Military = {
        id: "military-id-3",
        militaryRankId: "rank-id",
        rg: 789012,
        name: "José Costa",
      };

      militaryRepository.findById.mockImplementation((id) => {
        if (id === "military-id")
          return Promise.resolve({
            ...mockMilitary,
            militaryRank: mockMilitaryRank,
          });
        if (id === "military-id-2")
          return Promise.resolve({
            ...mockMilitary2,
            militaryRank: mockMilitaryRank,
          });
        if (id === "military-id-3")
          return Promise.resolve({
            ...mockMilitary3,
            militaryRank: mockMilitaryRank,
          });
        return Promise.resolve(null);
      });

      await sut.create({
        militaryId: "military-id",
        role: UserRole.ADMIN,
        password: "pass1",
      });
      await sut.create({
        militaryId: "military-id-2",
        role: UserRole.CHEFE,
        password: "pass2",
      });
      await sut.create({
        militaryId: "military-id-3",
        role: UserRole.BOMBEIRO,
        password: "pass3",
      });

      const result = await sut.listAll();

      expect(result[0].role).toBe(UserRole.ADMIN);
      expect(result[1].role).toBe(UserRole.CHEFE);
      expect(result[2].role).toBe(UserRole.BOMBEIRO);
    });

    it("should throw EntityNotFoundError when any military not found", async () => {
      militaryRepository.findById.mockResolvedValue(null);

      await sut.create({
        militaryId: "military-id",
        role: UserRole.BOMBEIRO,
        password: "hashedPassword",
      });

      await expect(sut.listAll()).rejects.toThrow(EntityNotFoundError);
      await expect(sut.listAll()).rejects.toThrow("Militar");
    });
  });

  describe("update", () => {
    let userId: string;

    beforeEach(async () => {
      militaryRepository.findById.mockResolvedValue({
        ...mockMilitary,
        militaryRank: mockMilitaryRank,
      });
      await sut.create({
        militaryId: "military-id",
        role: UserRole.BOMBEIRO,
        password: "hashedPassword",
      });
      const items = await sut.listAll();
      userId = items[0].id;
    });

    it("should update existing user", async () => {
      const updateData: UserInputDTO = {
        militaryId: "new-military-id",
        role: UserRole.ADMIN,
        password: "newHashedPassword",
      };

      const newMockMilitary: Military = {
        id: "new-military-id",
        militaryRankId: "rank-id",
        rg: 999999,
        name: "João Silva Atualizado",
      };

      militaryRepository.findById.mockImplementation((id) => {
        if (id === "new-military-id")
          return Promise.resolve({
            ...newMockMilitary,
            militaryRank: mockMilitaryRank,
          });
        return Promise.resolve({
          ...mockMilitary,
          militaryRank: mockMilitaryRank,
        });
      });

      await sut.update(userId, updateData);

      const result = await sut.findById(userId);
      expect(result).not.toBeNull();
      expect(result?.military.id).toBe("new-military-id");
      expect(result?.role).toBe(UserRole.ADMIN);
      expect(result?.military).toEqual({
        ...newMockMilitary,
        militaryRank: mockMilitaryRank,
      });
      expect(result?.id).toBe(userId);
    });

    it("should partially update user", async () => {
      const updateData = { role: UserRole.ADMIN };

      await sut.update(userId, updateData as UserInputDTO);

      const result = await sut.findById(userId);
      expect(result).not.toBeNull();
      expect(result?.role).toBe(UserRole.ADMIN);
      expect(result?.military.id).toBe("military-id");
      expect(result?.id).toBe(userId);
    });

    it("should handle update of non-existent id gracefully", async () => {
      const updateData: UserInputDTO = {
        militaryId: "military-id",
        role: UserRole.ADMIN,
        password: "newPassword",
      };

      await sut.update("non-existent-id", updateData);

      const allItems = await sut.listAll();
      expect(allItems).toHaveLength(1);
      expect(allItems[0].role).toBe(UserRole.BOMBEIRO);
    });

    it("should not affect other users when updating", async () => {
      const mockMilitary2: Military = {
        id: "military-id-2",
        militaryRankId: "rank-id",
        rg: 654321,
        name: "Maria Santos",
      };

      militaryRepository.findById.mockImplementation((id) => {
        if (id === "military-id")
          return Promise.resolve({
            ...mockMilitary,
            militaryRank: mockMilitaryRank,
          });
        if (id === "military-id-2")
          return Promise.resolve({
            ...mockMilitary2,
            militaryRank: mockMilitaryRank,
          });
        return Promise.resolve(null);
      });

      await sut.create({
        militaryId: "military-id-2",
        role: UserRole.CHEFE,
        password: "password2",
      });

      const allItems = await sut.listAll();
      const secondId = allItems[1].id;

      await sut.update(userId, {
        militaryId: "military-id",
        role: UserRole.ADMIN,
        password: "updatedPassword",
      });

      const secondItem = await sut.findById(secondId);
      expect(secondItem?.role).toBe(UserRole.CHEFE);
      expect(secondItem?.military.id).toBe("military-id-2");
    });
  });

  describe("mapperUser", () => {
    it("should map user with military data correctly", async () => {
      militaryRepository.findById.mockResolvedValue({
        ...mockMilitary,
        militaryRank: mockMilitaryRank,
      });

      await sut.create({
        militaryId: "military-id",
        role: UserRole.BOMBEIRO,
        password: "hashedPassword",
      });

      const result = await sut.listAll();
      expect(result[0]).toEqual({
        id: expect.any(String),
        role: UserRole.BOMBEIRO,
        military: {
          ...mockMilitary,
          militaryRank: mockMilitaryRank,
        },
      });
    });

    it("should throw EntityNotFoundError when military not found in mapper", async () => {
      militaryRepository.findById.mockResolvedValue(null);

      await sut.create({
        militaryId: "invalid-military-id",
        role: UserRole.BOMBEIRO,
        password: "hashedPassword",
      });

      await expect(sut.listAll()).rejects.toThrow(EntityNotFoundError);
      await expect(sut.listAll()).rejects.toThrow("Militar");
    });
  });

  describe("integration scenarios", () => {
    beforeEach(() => {
      militaryRepository.findById.mockResolvedValue({
        ...mockMilitary,
        militaryRank: mockMilitaryRank,
      });
    });

    it("should handle complete CRUD operations", async () => {
      // Create
      await sut.create({
        militaryId: "military-id",
        role: UserRole.BOMBEIRO,
        password: "hashedPassword",
      });
      let items = await sut.listAll();
      expect(items).toHaveLength(1);
      const userId = items[0].id;

      // Read
      const foundById = await sut.findById(userId);
      expect(foundById).not.toBeNull();

      const foundByMilitaryId = await sut.findByMilitaryId("military-id");
      expect(foundByMilitaryId).not.toBeNull();

      const foundByMilitaryIdWithPassword =
        await sut.findByMilitaryIdWithPassword("military-id");
      expect(foundByMilitaryIdWithPassword).not.toBeNull();
      expect(foundByMilitaryIdWithPassword?.password).toBe("hashedPassword");

      // Update
      await sut.update(userId, {
        militaryId: "military-id",
        role: UserRole.ADMIN,
        password: "newHashedPassword",
      });
      const updatedItem = await sut.findById(userId);
      expect(updatedItem?.role).toBe(UserRole.ADMIN);

      // Delete
      await sut.delete(userId);
      items = await sut.listAll();
      expect(items).toHaveLength(0);
    });

    it("should handle concurrent operations correctly", async () => {
      const mockMilitary2: Military = {
        id: "military-id-2",
        militaryRankId: "rank-id",
        rg: 654321,
        name: "Maria Santos",
      };

      const mockMilitary3: Military = {
        id: "military-id-3",
        militaryRankId: "rank-id",
        rg: 789012,
        name: "José Costa",
      };

      militaryRepository.findById.mockImplementation((id) => {
        if (id === "military-id")
          return Promise.resolve({
            ...mockMilitary,
            militaryRank: mockMilitaryRank,
          });
        if (id === "military-id-2")
          return Promise.resolve({
            ...mockMilitary2,
            militaryRank: mockMilitaryRank,
          });
        if (id === "military-id-3")
          return Promise.resolve({
            ...mockMilitary3,
            militaryRank: mockMilitaryRank,
          });
        return Promise.resolve(null);
      });

      const operations = [
        sut.create({
          militaryId: "military-id",
          role: UserRole.ADMIN,
          password: "pass1",
        }),
        sut.create({
          militaryId: "military-id-2",
          role: UserRole.CHEFE,
          password: "pass2",
        }),
        sut.create({
          militaryId: "military-id-3",
          role: UserRole.BOMBEIRO,
          password: "pass3",
        }),
      ];

      await Promise.all(operations);

      const result = await sut.listAll();
      expect(result).toHaveLength(3);
    });

    it("should maintain data consistency across operations", async () => {
      const mockMilitary2: Military = {
        id: "military-id-2",
        militaryRankId: "rank-id",
        rg: 654321,
        name: "Maria Santos",
      };

      militaryRepository.findById.mockImplementation((id) => {
        if (id === "military-id")
          return Promise.resolve({
            ...mockMilitary,
            militaryRank: mockMilitaryRank,
          });
        if (id === "military-id-2")
          return Promise.resolve({
            ...mockMilitary2,
            militaryRank: mockMilitaryRank,
          });
        return Promise.resolve(null);
      });

      // Create initial data
      await sut.create({
        militaryId: "military-id",
        role: UserRole.BOMBEIRO,
        password: "pass1",
      });
      await sut.create({
        militaryId: "military-id-2",
        role: UserRole.CHEFE,
        password: "pass2",
      });

      // Get initial state
      const initialItems = await sut.listAll();
      const userJoaoId = initialItems.find(
        (item) => item.military.id === "military-id",
      )?.id;

      // Update and verify
      await sut.update(userJoaoId!, {
        militaryId: "military-id",
        role: UserRole.ADMIN,
        password: "newPass1",
      });

      // Verify all access methods return consistent data
      const byId = await sut.findById(userJoaoId!);
      const byMilitaryId = await sut.findByMilitaryId("military-id");
      const all = await sut.listAll();

      expect(byId?.role).toBe(UserRole.ADMIN);
      expect(byMilitaryId?.role).toBe(UserRole.ADMIN);
      expect(all.find((item) => item.id === userJoaoId)?.role).toBe(
        UserRole.ADMIN,
      );
    });

    it("should handle users with different roles correctly", async () => {
      const mockMilitary2: Military = {
        id: "military-id-2",
        militaryRankId: "rank-id",
        rg: 654321,
        name: "Maria Santos",
      };

      const mockMilitary3: Military = {
        id: "military-id-3",
        militaryRankId: "rank-id",
        rg: 789012,
        name: "José Costa",
      };

      militaryRepository.findById.mockImplementation((id) => {
        if (id === "military-id")
          return Promise.resolve({
            ...mockMilitary,
            militaryRank: mockMilitaryRank,
          });
        if (id === "military-id-2")
          return Promise.resolve({
            ...mockMilitary2,
            militaryRank: mockMilitaryRank,
          });
        if (id === "military-id-3")
          return Promise.resolve({
            ...mockMilitary3,
            militaryRank: mockMilitaryRank,
          });
        return Promise.resolve(null);
      });

      await sut.create({
        militaryId: "military-id",
        role: UserRole.ADMIN,
        password: "adminPass",
      });
      await sut.create({
        militaryId: "military-id-2",
        role: UserRole.CHEFE,
        password: "chefePass",
      });
      await sut.create({
        militaryId: "military-id-3",
        role: UserRole.BOMBEIRO,
        password: "bombeiroPass",
      });

      const result = await sut.listAll();

      expect(result).toHaveLength(3);
      expect(result[0].role).toBe(UserRole.ADMIN);
      expect(result[1].role).toBe(UserRole.CHEFE);
      expect(result[2].role).toBe(UserRole.BOMBEIRO);
    });
  });
});
