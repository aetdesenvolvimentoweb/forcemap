import { MilitaryRankRepositoryInMemory } from "../../../../../src/infra/repositories/in-memory";
import { MilitaryRankInputDTO } from "../../../../../src/domain/dtos";
import { MilitaryRank } from "../../../../../src/domain/entities";

describe("MilitaryRankRepositoryInMemory", () => {
  let sut: MilitaryRankRepositoryInMemory;

  beforeEach(() => {
    sut = new MilitaryRankRepositoryInMemory();
  });

  describe("create", () => {
    const inputData: MilitaryRankInputDTO = {
      abbreviation: "CEL",
      order: 10,
    };

    it("should create military rank successfully", async () => {
      await sut.create(inputData);

      const result = await sut.listAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          abbreviation: inputData.abbreviation,
          order: inputData.order,
          id: expect.any(String),
        }),
      );
    });

    it("should generate unique UUID for each military rank", async () => {
      await sut.create(inputData);
      await sut.create({ ...inputData, abbreviation: "MAJ" });

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

    it("should create multiple military ranks", async () => {
      await sut.create({ abbreviation: "CEL", order: 10 });
      await sut.create({ abbreviation: "MAJ", order: 8 });
      await sut.create({ abbreviation: "CAP", order: 6 });

      const result = await sut.listAll();
      expect(result).toHaveLength(3);
    });

    it("should handle special characters in abbreviation", async () => {
      const dataWithSpecialChars: MilitaryRankInputDTO = {
        abbreviation: "1º SGT",
        order: 5,
      };

      await sut.create(dataWithSpecialChars);

      const result = await sut.listAll();
      expect(result[0].abbreviation).toBe("1º SGT");
    });

    it("should handle zero order", async () => {
      const dataWithZeroOrder: MilitaryRankInputDTO = {
        abbreviation: "REC",
        order: 0,
      };

      await sut.create(dataWithZeroOrder);

      const result = await sut.listAll();
      expect(result[0].order).toBe(0);
    });
  });

  describe("delete", () => {
    it("should delete existing military rank", async () => {
      await sut.create({ abbreviation: "CEL", order: 10 });
      const beforeDelete = await sut.listAll();
      const militaryRankId = beforeDelete[0].id;

      await sut.delete(militaryRankId);

      const afterDelete = await sut.listAll();
      expect(afterDelete).toHaveLength(0);
    });

    it("should not affect other military ranks when deleting", async () => {
      await sut.create({ abbreviation: "CEL", order: 10 });
      await sut.create({ abbreviation: "MAJ", order: 8 });
      await sut.create({ abbreviation: "CAP", order: 6 });

      const allItems = await sut.listAll();
      const militaryRankToDelete = allItems[1].id;

      await sut.delete(militaryRankToDelete);

      const remainingItems = await sut.listAll();
      expect(remainingItems).toHaveLength(2);
      expect(
        remainingItems.find((item) => item.id === militaryRankToDelete),
      ).toBeUndefined();
    });

    it("should handle deletion of non-existent id gracefully", async () => {
      await sut.create({ abbreviation: "CEL", order: 10 });
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

  describe("findByAbbreviation", () => {
    beforeEach(async () => {
      await sut.create({ abbreviation: "CEL", order: 10 });
      await sut.create({ abbreviation: "MAJ", order: 8 });
      await sut.create({ abbreviation: "CAP", order: 6 });
    });

    it("should find military rank by abbreviation", async () => {
      const result = await sut.findByAbbreviation("MAJ");

      expect(result).not.toBeNull();
      expect(result?.abbreviation).toBe("MAJ");
      expect(result?.order).toBe(8);
    });

    it("should return null when abbreviation not found", async () => {
      const result = await sut.findByAbbreviation("NON_EXISTENT");

      expect(result).toBeNull();
    });

    it("should be case sensitive", async () => {
      const result = await sut.findByAbbreviation("maj");

      expect(result).toBeNull();
    });

    it("should find military rank with special characters", async () => {
      await sut.create({ abbreviation: "1º SGT", order: 5 });

      const result = await sut.findByAbbreviation("1º SGT");

      expect(result).not.toBeNull();
      expect(result?.abbreviation).toBe("1º SGT");
    });

    it("should return first match when there are duplicates", async () => {
      await sut.create({ abbreviation: "DUP", order: 1 });
      await sut.create({ abbreviation: "DUP", order: 2 });

      const result = await sut.findByAbbreviation("DUP");

      expect(result).not.toBeNull();
      expect(result?.order).toBe(1);
    });
  });

  describe("findById", () => {
    let militaryRankId: string;

    beforeEach(async () => {
      await sut.create({ abbreviation: "CEL", order: 10 });
      const items = await sut.listAll();
      militaryRankId = items[0].id;
    });

    it("should find military rank by id", async () => {
      const result = await sut.findById(militaryRankId);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(militaryRankId);
      expect(result?.abbreviation).toBe("CEL");
    });

    it("should return null when id not found", async () => {
      const result = await sut.findById("non-existent-id");

      expect(result).toBeNull();
    });

    it("should return null for empty string id", async () => {
      const result = await sut.findById("");

      expect(result).toBeNull();
    });
  });

  describe("findByOrder", () => {
    beforeEach(async () => {
      await sut.create({ abbreviation: "CEL", order: 10 });
      await sut.create({ abbreviation: "MAJ", order: 8 });
      await sut.create({ abbreviation: "CAP", order: 6 });
    });

    it("should find military rank by order", async () => {
      const result = await sut.findByOrder(8);

      expect(result).not.toBeNull();
      expect(result?.order).toBe(8);
      expect(result?.abbreviation).toBe("MAJ");
    });

    it("should return null when order not found", async () => {
      const result = await sut.findByOrder(999);

      expect(result).toBeNull();
    });

    it("should find military rank with zero order", async () => {
      await sut.create({ abbreviation: "REC", order: 0 });

      const result = await sut.findByOrder(0);

      expect(result).not.toBeNull();
      expect(result?.order).toBe(0);
      expect(result?.abbreviation).toBe("REC");
    });

    it("should return first match when there are duplicates", async () => {
      await sut.create({ abbreviation: "DUP1", order: 5 });
      await sut.create({ abbreviation: "DUP2", order: 5 });

      const result = await sut.findByOrder(5);

      expect(result).not.toBeNull();
      expect(result?.abbreviation).toBe("DUP1");
    });
  });

  describe("listAll", () => {
    it("should return empty array when no military ranks exist", async () => {
      const result = await sut.listAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should return all military ranks", async () => {
      await sut.create({ abbreviation: "CEL", order: 10 });
      await sut.create({ abbreviation: "MAJ", order: 8 });
      await sut.create({ abbreviation: "CAP", order: 6 });

      const result = await sut.listAll();

      expect(result).toHaveLength(3);
      expect(result[0].abbreviation).toBe("CEL");
      expect(result[1].abbreviation).toBe("MAJ");
      expect(result[2].abbreviation).toBe("CAP");
    });

    it("should return military ranks in insertion order", async () => {
      const ranks = [
        { abbreviation: "FIRST", order: 1 },
        { abbreviation: "SECOND", order: 2 },
        { abbreviation: "THIRD", order: 3 },
      ];

      for (const rank of ranks) {
        await sut.create(rank);
      }

      const result = await sut.listAll();

      expect(result[0].abbreviation).toBe("FIRST");
      expect(result[1].abbreviation).toBe("SECOND");
      expect(result[2].abbreviation).toBe("THIRD");
    });

    it("should return a new array reference each time", async () => {
      await sut.create({ abbreviation: "CEL", order: 10 });

      const result1 = await sut.listAll();
      const result2 = await sut.listAll();

      expect(result1).toEqual(result2);
      expect(result1).toBe(result2); // Should be same reference for in-memory implementation
    });
  });

  describe("update", () => {
    let militaryRankId: string;

    beforeEach(async () => {
      await sut.create({ abbreviation: "CEL", order: 10 });
      const items = await sut.listAll();
      militaryRankId = items[0].id;
    });

    it("should update existing military rank", async () => {
      const updateData: MilitaryRankInputDTO = {
        abbreviation: "UPDATED",
        order: 20,
      };

      await sut.update(militaryRankId, updateData);

      const result = await sut.findById(militaryRankId);
      expect(result).not.toBeNull();
      expect(result?.abbreviation).toBe("UPDATED");
      expect(result?.order).toBe(20);
      expect(result?.id).toBe(militaryRankId);
    });

    it("should partially update military rank", async () => {
      const updateData = { abbreviation: "PARTIAL" };

      await sut.update(militaryRankId, updateData as MilitaryRankInputDTO);

      const result = await sut.findById(militaryRankId);
      expect(result).not.toBeNull();
      expect(result?.abbreviation).toBe("PARTIAL");
      expect(result?.order).toBe(10); // Should keep original order
      expect(result?.id).toBe(militaryRankId);
    });

    it("should handle update of non-existent id gracefully", async () => {
      const updateData: MilitaryRankInputDTO = {
        abbreviation: "NOT_FOUND",
        order: 999,
      };

      await sut.update("non-existent-id", updateData);

      const allItems = await sut.listAll();
      expect(allItems).toHaveLength(1);
      expect(allItems[0].abbreviation).toBe("CEL"); // Original unchanged
    });

    it("should update with special characters", async () => {
      const updateData: MilitaryRankInputDTO = {
        abbreviation: "1º TEN",
        order: 4,
      };

      await sut.update(militaryRankId, updateData);

      const result = await sut.findById(militaryRankId);
      expect(result?.abbreviation).toBe("1º TEN");
    });

    it("should update with zero order", async () => {
      const updateData: MilitaryRankInputDTO = {
        abbreviation: "REC",
        order: 0,
      };

      await sut.update(militaryRankId, updateData);

      const result = await sut.findById(militaryRankId);
      expect(result?.order).toBe(0);
    });

    it("should not affect other military ranks when updating", async () => {
      await sut.create({ abbreviation: "MAJ", order: 8 });
      const allItems = await sut.listAll();
      const secondId = allItems[1].id;

      await sut.update(militaryRankId, { abbreviation: "UPDATED", order: 99 });

      const secondItem = await sut.findById(secondId);
      expect(secondItem?.abbreviation).toBe("MAJ");
      expect(secondItem?.order).toBe(8);
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete CRUD operations", async () => {
      // Create
      await sut.create({ abbreviation: "CEL", order: 10 });
      let items = await sut.listAll();
      expect(items).toHaveLength(1);
      const militaryRankId = items[0].id;

      // Read
      const foundById = await sut.findById(militaryRankId);
      expect(foundById).not.toBeNull();

      const foundByAbbreviation = await sut.findByAbbreviation("CEL");
      expect(foundByAbbreviation).not.toBeNull();

      const foundByOrder = await sut.findByOrder(10);
      expect(foundByOrder).not.toBeNull();

      // Update
      await sut.update(militaryRankId, { abbreviation: "UPDATED", order: 20 });
      const updatedItem = await sut.findById(militaryRankId);
      expect(updatedItem?.abbreviation).toBe("UPDATED");

      // Delete
      await sut.delete(militaryRankId);
      items = await sut.listAll();
      expect(items).toHaveLength(0);
    });

    it("should handle concurrent operations correctly", async () => {
      const operations = [
        sut.create({ abbreviation: "CEL", order: 10 }),
        sut.create({ abbreviation: "MAJ", order: 8 }),
        sut.create({ abbreviation: "CAP", order: 6 }),
      ];

      await Promise.all(operations);

      const result = await sut.listAll();
      expect(result).toHaveLength(3);
    });

    it("should maintain data consistency across operations", async () => {
      // Create initial data
      await sut.create({ abbreviation: "CEL", order: 10 });
      await sut.create({ abbreviation: "MAJ", order: 8 });

      // Get initial state
      const initialItems = await sut.listAll();
      const celId = initialItems.find(
        (item) => item.abbreviation === "CEL",
      )?.id;

      // Update and verify
      await sut.update(celId!, { abbreviation: "COLONEL", order: 11 });

      // Verify all access methods return consistent data
      const byId = await sut.findById(celId!);
      const byAbbreviation = await sut.findByAbbreviation("COLONEL");
      const byOrder = await sut.findByOrder(11);
      const all = await sut.listAll();

      expect(byId?.abbreviation).toBe("COLONEL");
      expect(byAbbreviation?.abbreviation).toBe("COLONEL");
      expect(byOrder?.abbreviation).toBe("COLONEL");
      expect(all.find((item) => item.id === celId)?.abbreviation).toBe(
        "COLONEL",
      );
    });
  });
});
