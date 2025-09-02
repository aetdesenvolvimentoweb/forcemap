import { MilitaryRepositoryInMemory } from "../../../../../src/infra/repositories/in-memory";
import {
  MilitaryInputDTO,
  MilitaryOutputDTO,
} from "../../../../../src/domain/dtos";
import { Military, MilitaryRank } from "../../../../../src/domain/entities";
import { MilitaryRankRepository } from "../../../../../src/domain/repositories";
import { EntityNotFoundError } from "../../../../../src/application/errors";

const makeMilitaryRankRepositoryMock =
  (): jest.Mocked<MilitaryRankRepository> => ({
    create: jest.fn(),
    delete: jest.fn(),
    findByAbbreviation: jest.fn(),
    findById: jest.fn(),
    findByOrder: jest.fn(),
    listAll: jest.fn(),
    update: jest.fn(),
  });

describe("MilitaryRepositoryInMemory", () => {
  let sut: MilitaryRepositoryInMemory;
  let militaryRankRepository: jest.Mocked<MilitaryRankRepository>;

  const mockMilitaryRank: MilitaryRank = {
    id: "rank-id",
    abbreviation: "CEL",
    order: 10,
  };

  beforeEach(() => {
    militaryRankRepository = makeMilitaryRankRepositoryMock();
    sut = new MilitaryRepositoryInMemory(militaryRankRepository);
  });

  describe("create", () => {
    const inputData: MilitaryInputDTO = {
      militaryRankId: "rank-id",
      rg: 123456,
      name: "João Silva",
    };

    beforeEach(() => {
      militaryRankRepository.findById.mockResolvedValue(mockMilitaryRank);
    });

    it("should create military successfully", async () => {
      await sut.create(inputData);

      const result = await sut.listAll();
      expect(result).toHaveLength(1);
    });

    it("should generate unique UUID for each military", async () => {
      await sut.create(inputData);
      await sut.create({ ...inputData, rg: 654321, name: "Maria Santos" });

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

    it("should create multiple military personnel", async () => {
      const mockRank1: MilitaryRank = {
        id: "rank1",
        abbreviation: "CEL",
        order: 10,
      };
      const mockRank2: MilitaryRank = {
        id: "rank2",
        abbreviation: "MAJ",
        order: 8,
      };
      const mockRank3: MilitaryRank = {
        id: "rank3",
        abbreviation: "CAP",
        order: 6,
      };

      militaryRankRepository.findById.mockImplementation((id) => {
        if (id === "rank1") return Promise.resolve(mockRank1);
        if (id === "rank2") return Promise.resolve(mockRank2);
        if (id === "rank3") return Promise.resolve(mockRank3);
        return Promise.resolve(mockMilitaryRank);
      });

      await sut.create({ militaryRankId: "rank1", rg: 111111, name: "João" });
      await sut.create({ militaryRankId: "rank2", rg: 222222, name: "Maria" });
      await sut.create({ militaryRankId: "rank3", rg: 333333, name: "José" });

      const result = await sut.listAll();
      expect(result).toHaveLength(3);
    });
  });

  describe("delete", () => {
    beforeEach(async () => {
      militaryRankRepository.findById.mockResolvedValue(mockMilitaryRank);
    });

    it("should delete existing military", async () => {
      await sut.create({
        militaryRankId: "rank-id",
        rg: 123456,
        name: "João Silva",
      });
      const beforeDelete = await sut.listAll();
      const militaryId = beforeDelete[0].id;

      await sut.delete(militaryId);

      const afterDelete = await sut.listAll();
      expect(afterDelete).toHaveLength(0);
    });

    it("should not affect other military when deleting", async () => {
      await sut.create({
        militaryRankId: "rank-id",
        rg: 111111,
        name: "João",
      });
      await sut.create({
        militaryRankId: "rank-id",
        rg: 222222,
        name: "Maria",
      });
      await sut.create({
        militaryRankId: "rank-id",
        rg: 333333,
        name: "José",
      });

      const allItems = await sut.listAll();
      const militaryToDelete = allItems[1].id;

      await sut.delete(militaryToDelete);

      const remainingItems = await sut.listAll();
      expect(remainingItems).toHaveLength(2);
      expect(
        remainingItems.find((item) => item.id === militaryToDelete),
      ).toBeUndefined();
    });

    it("should handle deletion of non-existent id gracefully", async () => {
      await sut.create({
        militaryRankId: "rank-id",
        rg: 123456,
        name: "João Silva",
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

  describe("findByRg", () => {
    beforeEach(async () => {
      militaryRankRepository.findById.mockResolvedValue(mockMilitaryRank);
      await sut.create({
        militaryRankId: "rank-id",
        rg: 123456,
        name: "João Silva",
      });
      await sut.create({
        militaryRankId: "rank-id",
        rg: 654321,
        name: "Maria Santos",
      });
      await sut.create({
        militaryRankId: "rank-id",
        rg: 789012,
        name: "José Costa",
      });
    });

    it("should find military by RG", async () => {
      const result = await sut.findByRg(654321);

      expect(result).not.toBeNull();
      expect(result?.rg).toBe(654321);
      expect(result?.name).toBe("Maria Santos");
      expect(result?.militaryRank).toEqual(mockMilitaryRank);
      expect(militaryRankRepository.findById).toHaveBeenCalledWith("rank-id");
    });

    it("should return null when RG not found", async () => {
      const result = await sut.findByRg(999999);

      expect(result).toBeNull();
    });

    it("should throw EntityNotFoundError when military rank not found", async () => {
      militaryRankRepository.findById.mockResolvedValue(null);

      await expect(sut.findByRg(123456)).rejects.toThrow(EntityNotFoundError);
      await expect(sut.findByRg(123456)).rejects.toThrow("Posto/Graduação");
    });

    it("should handle zero RG", async () => {
      await sut.create({
        militaryRankId: "rank-id",
        rg: 0,
        name: "Militar Zero",
      });

      const result = await sut.findByRg(0);

      expect(result).not.toBeNull();
      expect(result?.rg).toBe(0);
      expect(result?.name).toBe("Militar Zero");
    });
  });

  describe("findById", () => {
    let militaryId: string;

    beforeEach(async () => {
      militaryRankRepository.findById.mockResolvedValue(mockMilitaryRank);
      await sut.create({
        militaryRankId: "rank-id",
        rg: 123456,
        name: "João Silva",
      });
      const items = await sut.listAll();
      militaryId = items[0].id;
    });

    it("should find military by id", async () => {
      const result = await sut.findById(militaryId);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(militaryId);
      expect(result?.name).toBe("João Silva");
      expect(result?.militaryRank).toEqual(mockMilitaryRank);
      expect(militaryRankRepository.findById).toHaveBeenCalledWith("rank-id");
    });

    it("should return null when id not found", async () => {
      const result = await sut.findById("non-existent-id");

      expect(result).toBeNull();
    });

    it("should throw EntityNotFoundError when military rank not found", async () => {
      militaryRankRepository.findById.mockResolvedValue(null);

      await expect(sut.findById(militaryId)).rejects.toThrow(
        EntityNotFoundError,
      );
      await expect(sut.findById(militaryId)).rejects.toThrow("Posto/Graduação");
    });

    it("should return null for empty string id", async () => {
      const result = await sut.findById("");

      expect(result).toBeNull();
    });
  });

  describe("listAll", () => {
    it("should return empty array when no military exist", async () => {
      const result = await sut.listAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should return all military with mapped military ranks", async () => {
      militaryRankRepository.findById.mockResolvedValue(mockMilitaryRank);

      await sut.create({
        militaryRankId: "rank-id",
        rg: 111111,
        name: "João",
      });
      await sut.create({
        militaryRankId: "rank-id",
        rg: 222222,
        name: "Maria",
      });
      await sut.create({
        militaryRankId: "rank-id",
        rg: 333333,
        name: "José",
      });

      const result = await sut.listAll();

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe("João");
      expect(result[0].militaryRank).toEqual(mockMilitaryRank);
      expect(result[1].name).toBe("Maria");
      expect(result[1].militaryRank).toEqual(mockMilitaryRank);
      expect(result[2].name).toBe("José");
      expect(result[2].militaryRank).toEqual(mockMilitaryRank);
      expect(militaryRankRepository.findById).toHaveBeenCalledTimes(3);
    });

    it("should return military in insertion order", async () => {
      militaryRankRepository.findById.mockResolvedValue(mockMilitaryRank);

      const military = [
        { militaryRankId: "rank-id", rg: 111111, name: "FIRST" },
        { militaryRankId: "rank-id", rg: 222222, name: "SECOND" },
        { militaryRankId: "rank-id", rg: 333333, name: "THIRD" },
      ];

      for (const mil of military) {
        await sut.create(mil);
      }

      const result = await sut.listAll();

      expect(result[0].name).toBe("FIRST");
      expect(result[1].name).toBe("SECOND");
      expect(result[2].name).toBe("THIRD");
    });

    it("should throw EntityNotFoundError when any military rank not found", async () => {
      militaryRankRepository.findById.mockResolvedValue(null);

      await sut.create({
        militaryRankId: "rank-id",
        rg: 123456,
        name: "João Silva",
      });

      await expect(sut.listAll()).rejects.toThrow(EntityNotFoundError);
      await expect(sut.listAll()).rejects.toThrow("Posto/Graduação");
    });
  });

  describe("update", () => {
    let militaryId: string;

    beforeEach(async () => {
      militaryRankRepository.findById.mockResolvedValue(mockMilitaryRank);
      await sut.create({
        militaryRankId: "rank-id",
        rg: 123456,
        name: "João Silva",
      });
      const items = await sut.listAll();
      militaryId = items[0].id;
    });

    it("should update existing military", async () => {
      const updateData: MilitaryInputDTO = {
        militaryRankId: "new-rank-id",
        rg: 999999,
        name: "João Silva Atualizado",
      };

      const newMockRank: MilitaryRank = {
        id: "new-rank-id",
        abbreviation: "MAJ",
        order: 8,
      };

      militaryRankRepository.findById.mockImplementation((id) => {
        if (id === "new-rank-id") return Promise.resolve(newMockRank);
        return Promise.resolve(mockMilitaryRank);
      });

      await sut.update(militaryId, updateData);

      const result = await sut.findById(militaryId);
      expect(result).not.toBeNull();
      expect(result?.name).toBe("João Silva Atualizado");
      expect(result?.rg).toBe(999999);
      expect(result?.militaryRankId).toBe("new-rank-id");
      expect(result?.militaryRank).toEqual(newMockRank);
      expect(result?.id).toBe(militaryId);
    });

    it("should partially update military", async () => {
      const updateData = { name: "Nome Parcial" };

      await sut.update(militaryId, updateData as MilitaryInputDTO);

      const result = await sut.findById(militaryId);
      expect(result).not.toBeNull();
      expect(result?.name).toBe("Nome Parcial");
      expect(result?.rg).toBe(123456);
      expect(result?.militaryRankId).toBe("rank-id");
      expect(result?.id).toBe(militaryId);
    });

    it("should handle update of non-existent id gracefully", async () => {
      const updateData: MilitaryInputDTO = {
        militaryRankId: "rank-id",
        rg: 999999,
        name: "Não Encontrado",
      };

      await sut.update("non-existent-id", updateData);

      const allItems = await sut.listAll();
      expect(allItems).toHaveLength(1);
      expect(allItems[0].name).toBe("João Silva");
    });

    it("should not affect other military when updating", async () => {
      await sut.create({
        militaryRankId: "rank-id",
        rg: 654321,
        name: "Maria Santos",
      });
      const allItems = await sut.listAll();
      const secondId = allItems[1].id;

      await sut.update(militaryId, {
        militaryRankId: "rank-id",
        rg: 999999,
        name: "João Atualizado",
      });

      const secondItem = await sut.findById(secondId);
      expect(secondItem?.name).toBe("Maria Santos");
      expect(secondItem?.rg).toBe(654321);
    });
  });

  describe("mapperMilitary", () => {
    it("should map military with military rank correctly", async () => {
      militaryRankRepository.findById.mockResolvedValue(mockMilitaryRank);

      await sut.create({
        militaryRankId: "rank-id",
        rg: 123456,
        name: "João Silva",
      });

      const result = await sut.listAll();
      expect(result[0]).toEqual({
        id: expect.any(String),
        militaryRankId: "rank-id",
        militaryRank: mockMilitaryRank,
        rg: 123456,
        name: "João Silva",
      });
    });

    it("should throw EntityNotFoundError when military rank not found in mapper", async () => {
      militaryRankRepository.findById.mockResolvedValue(null);

      await sut.create({
        militaryRankId: "invalid-rank-id",
        rg: 123456,
        name: "João Silva",
      });

      await expect(sut.listAll()).rejects.toThrow(EntityNotFoundError);
      await expect(sut.listAll()).rejects.toThrow("Posto/Graduação");
    });
  });

  describe("integration scenarios", () => {
    beforeEach(() => {
      militaryRankRepository.findById.mockResolvedValue(mockMilitaryRank);
    });

    it("should handle complete CRUD operations", async () => {
      // Create
      await sut.create({
        militaryRankId: "rank-id",
        rg: 123456,
        name: "João Silva",
      });
      let items = await sut.listAll();
      expect(items).toHaveLength(1);
      const militaryId = items[0].id;

      // Read
      const foundById = await sut.findById(militaryId);
      expect(foundById).not.toBeNull();

      const foundByRg = await sut.findByRg(123456);
      expect(foundByRg).not.toBeNull();

      // Update
      await sut.update(militaryId, {
        militaryRankId: "rank-id",
        rg: 999999,
        name: "João Atualizado",
      });
      const updatedItem = await sut.findById(militaryId);
      expect(updatedItem?.name).toBe("João Atualizado");

      // Delete
      await sut.delete(militaryId);
      items = await sut.listAll();
      expect(items).toHaveLength(0);
    });

    it("should handle concurrent operations correctly", async () => {
      const operations = [
        sut.create({
          militaryRankId: "rank-id",
          rg: 111111,
          name: "João",
        }),
        sut.create({
          militaryRankId: "rank-id",
          rg: 222222,
          name: "Maria",
        }),
        sut.create({
          militaryRankId: "rank-id",
          rg: 333333,
          name: "José",
        }),
      ];

      await Promise.all(operations);

      const result = await sut.listAll();
      expect(result).toHaveLength(3);
    });

    it("should maintain data consistency across operations", async () => {
      // Create initial data
      await sut.create({
        militaryRankId: "rank-id",
        rg: 111111,
        name: "João",
      });
      await sut.create({
        militaryRankId: "rank-id",
        rg: 222222,
        name: "Maria",
      });

      // Get initial state
      const initialItems = await sut.listAll();
      const joaoId = initialItems.find((item) => item.name === "João")?.id;

      // Update and verify
      await sut.update(joaoId!, {
        militaryRankId: "rank-id",
        rg: 999999,
        name: "João Silva",
      });

      // Verify all access methods return consistent data
      const byId = await sut.findById(joaoId!);
      const byRg = await sut.findByRg(999999);
      const all = await sut.listAll();

      expect(byId?.name).toBe("João Silva");
      expect(byRg?.name).toBe("João Silva");
      expect(all.find((item) => item.id === joaoId)?.name).toBe("João Silva");
    });

    it("should handle multiple military with different ranks", async () => {
      const majorRank: MilitaryRank = {
        id: "major-id",
        abbreviation: "MAJ",
        order: 8,
      };

      const captainRank: MilitaryRank = {
        id: "captain-id",
        abbreviation: "CAP",
        order: 6,
      };

      militaryRankRepository.findById.mockImplementation((id) => {
        if (id === "colonel-id") return Promise.resolve(mockMilitaryRank);
        if (id === "major-id") return Promise.resolve(majorRank);
        if (id === "captain-id") return Promise.resolve(captainRank);
        return Promise.resolve(null);
      });

      await sut.create({
        militaryRankId: "colonel-id",
        rg: 111111,
        name: "João Colonel",
      });
      await sut.create({
        militaryRankId: "major-id",
        rg: 222222,
        name: "Maria Major",
      });
      await sut.create({
        militaryRankId: "captain-id",
        rg: 333333,
        name: "José Captain",
      });

      const result = await sut.listAll();

      expect(result).toHaveLength(3);
      expect(result[0].militaryRank.abbreviation).toBe("CEL");
      expect(result[1].militaryRank.abbreviation).toBe("MAJ");
      expect(result[2].militaryRank.abbreviation).toBe("CAP");
    });
  });
});
