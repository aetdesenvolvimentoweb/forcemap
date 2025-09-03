import { VehicleInputDTO } from "../../../../../src/domain/dtos";
import { VehicleSituation } from "../../../../../src/domain/entities";
import { VehicleRepositoryInMemory } from "../../../../../src/infra/repositories/in-memory";

describe("VehicleRepositoryInMemory", () => {
  let sut: VehicleRepositoryInMemory;

  beforeEach(() => {
    sut = new VehicleRepositoryInMemory();
  });

  describe("create", () => {
    const inputData: VehicleInputDTO = {
      name: "Viatura 01",
      situation: VehicleSituation.ATIVA,
      complement: "Complemento teste",
    };

    it("should create vehicle successfully", async () => {
      await sut.create(inputData);

      const result = await sut.listAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: expect.any(String),
        name: "Viatura 01",
        situation: VehicleSituation.ATIVA,
        complement: "Complemento teste",
      });
    });

    it("should generate unique UUID for each vehicle", async () => {
      await sut.create(inputData);
      await sut.create({ ...inputData, name: "Viatura 02" });

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

    it("should create vehicle without complement", async () => {
      const dataWithoutComplement: VehicleInputDTO = {
        name: "Viatura sem complemento",
        situation: VehicleSituation.BAIXADA,
      };

      await sut.create(dataWithoutComplement);

      const result = await sut.listAll();
      expect(result).toHaveLength(1);
      expect(result[0].complement).toBeUndefined();
      expect(result[0].name).toBe("Viatura sem complemento");
      expect(result[0].situation).toBe(VehicleSituation.BAIXADA);
    });

    it("should create multiple vehicles", async () => {
      const vehicles = [
        { name: "Viatura A", situation: VehicleSituation.ATIVA },
        { name: "Viatura B", situation: VehicleSituation.BAIXADA },
        {
          name: "Viatura C",
          situation: VehicleSituation.ATIVA,
          complement: "Teste",
        },
      ];

      for (const vehicle of vehicles) {
        await sut.create(vehicle);
      }

      const result = await sut.listAll();
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe("Viatura A");
      expect(result[1].name).toBe("Viatura B");
      expect(result[2].name).toBe("Viatura C");
    });
  });

  describe("delete", () => {
    beforeEach(async () => {
      await sut.create({
        name: "Viatura Teste",
        situation: VehicleSituation.ATIVA,
        complement: "Para deletar",
      });
    });

    it("should delete existing vehicle", async () => {
      const beforeDelete = await sut.listAll();
      const vehicleId = beforeDelete[0].id;

      await sut.delete(vehicleId);

      const afterDelete = await sut.listAll();
      expect(afterDelete).toHaveLength(0);
    });

    it("should not affect other vehicles when deleting", async () => {
      await sut.create({
        name: "Viatura 1",
        situation: VehicleSituation.ATIVA,
      });
      await sut.create({
        name: "Viatura 2",
        situation: VehicleSituation.BAIXADA,
      });
      await sut.create({
        name: "Viatura 3",
        situation: VehicleSituation.ATIVA,
      });

      const allItems = await sut.listAll();
      const vehicleToDelete = allItems[1].id;

      await sut.delete(vehicleToDelete);

      const remainingItems = await sut.listAll();
      expect(remainingItems).toHaveLength(3);
      expect(
        remainingItems.find((item) => item.id === vehicleToDelete),
      ).toBeUndefined();
    });

    it("should handle deletion of non-existent id gracefully", async () => {
      const nonExistentId = "non-existent-id";

      await sut.delete(nonExistentId);

      const result = await sut.listAll();
      expect(result).toHaveLength(1);
    });

    it("should handle deletion from empty repository", async () => {
      const nonExistentId = "non-existent-id";

      // Clear the repository first
      const items = await sut.listAll();
      for (const item of items) {
        await sut.delete(item.id);
      }

      await sut.delete(nonExistentId);

      const result = await sut.listAll();
      expect(result).toHaveLength(0);
    });
  });

  describe("findByName", () => {
    beforeEach(async () => {
      await sut.create({
        name: "Viatura Alpha",
        situation: VehicleSituation.ATIVA,
        complement: "Teste 1",
      });
      await sut.create({
        name: "Viatura Beta",
        situation: VehicleSituation.BAIXADA,
        complement: "Teste 2",
      });
      await sut.create({
        name: "Viatura Gamma",
        situation: VehicleSituation.ATIVA,
      });
    });

    it("should find vehicle by name", async () => {
      const result = await sut.findByName("Viatura Beta");

      expect(result).not.toBeNull();
      expect(result?.name).toBe("Viatura Beta");
      expect(result?.situation).toBe(VehicleSituation.BAIXADA);
      expect(result?.complement).toBe("Teste 2");
    });

    it("should return null when name not found", async () => {
      const result = await sut.findByName("Viatura Inexistente");

      expect(result).toBeNull();
    });

    it("should be case sensitive", async () => {
      const result = await sut.findByName("viatura alpha");

      expect(result).toBeNull();
    });

    it("should find vehicle without complement", async () => {
      const result = await sut.findByName("Viatura Gamma");

      expect(result).not.toBeNull();
      expect(result?.name).toBe("Viatura Gamma");
      expect(result?.complement).toBeUndefined();
    });

    it("should return null for empty string name", async () => {
      const result = await sut.findByName("");

      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    let vehicleId: string;

    beforeEach(async () => {
      await sut.create({
        name: "Viatura ID Test",
        situation: VehicleSituation.ATIVA,
        complement: "Teste findById",
      });
      const items = await sut.listAll();
      vehicleId = items[0].id;
    });

    it("should find vehicle by id", async () => {
      const result = await sut.findById(vehicleId);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(vehicleId);
      expect(result?.name).toBe("Viatura ID Test");
      expect(result?.situation).toBe(VehicleSituation.ATIVA);
      expect(result?.complement).toBe("Teste findById");
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

  describe("listAll", () => {
    it("should return empty array when no vehicles exist", async () => {
      const result = await sut.listAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should return all vehicles", async () => {
      await sut.create({
        name: "Viatura 1",
        situation: VehicleSituation.ATIVA,
        complement: "Complemento 1",
      });
      await sut.create({
        name: "Viatura 2",
        situation: VehicleSituation.BAIXADA,
      });
      await sut.create({
        name: "Viatura 3",
        situation: VehicleSituation.ATIVA,
        complement: "Complemento 3",
      });

      const result = await sut.listAll();

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe("Viatura 1");
      expect(result[0].situation).toBe(VehicleSituation.ATIVA);
      expect(result[0].complement).toBe("Complemento 1");
      expect(result[1].name).toBe("Viatura 2");
      expect(result[1].situation).toBe(VehicleSituation.BAIXADA);
      expect(result[1].complement).toBeUndefined();
      expect(result[2].name).toBe("Viatura 3");
      expect(result[2].situation).toBe(VehicleSituation.ATIVA);
      expect(result[2].complement).toBe("Complemento 3");
    });

    it("should return vehicles in insertion order", async () => {
      const vehicles = [
        { name: "FIRST", situation: VehicleSituation.ATIVA },
        { name: "SECOND", situation: VehicleSituation.BAIXADA },
        { name: "THIRD", situation: VehicleSituation.ATIVA },
      ];

      for (const vehicle of vehicles) {
        await sut.create(vehicle);
      }

      const result = await sut.listAll();

      expect(result[0].name).toBe("FIRST");
      expect(result[1].name).toBe("SECOND");
      expect(result[2].name).toBe("THIRD");
    });
  });

  describe("update", () => {
    let vehicleId: string;

    beforeEach(async () => {
      await sut.create({
        name: "Viatura Original",
        situation: VehicleSituation.ATIVA,
        complement: "Complemento Original",
      });
      const items = await sut.listAll();
      vehicleId = items[0].id;
    });

    it("should update existing vehicle", async () => {
      const updateData: VehicleInputDTO = {
        name: "Viatura Atualizada",
        situation: VehicleSituation.BAIXADA,
        complement: "Complemento Atualizado",
      };

      await sut.update(vehicleId, updateData);

      const result = await sut.findById(vehicleId);
      expect(result).not.toBeNull();
      expect(result?.name).toBe("Viatura Atualizada");
      expect(result?.situation).toBe(VehicleSituation.BAIXADA);
      expect(result?.complement).toBe("Complemento Atualizado");
      expect(result?.id).toBe(vehicleId);
    });

    it("should partially update vehicle", async () => {
      const updateData = { name: "Nome Parcial" };

      await sut.update(vehicleId, updateData as VehicleInputDTO);

      const result = await sut.findById(vehicleId);
      expect(result).not.toBeNull();
      expect(result?.name).toBe("Nome Parcial");
      expect(result?.situation).toBe(VehicleSituation.ATIVA);
      expect(result?.complement).toBe("Complemento Original");
      expect(result?.id).toBe(vehicleId);
    });

    it("should preserve existing complement when not provided in update", async () => {
      const updateData = { name: "Viatura Nome Atualizado" };

      await sut.update(vehicleId, updateData as VehicleInputDTO);

      const result = await sut.findById(vehicleId);
      expect(result).not.toBeNull();
      expect(result?.name).toBe("Viatura Nome Atualizado");
      expect(result?.complement).toBe("Complemento Original");
    });

    it("should handle update of non-existent id gracefully", async () => {
      const updateData: VehicleInputDTO = {
        name: "Não Encontrada",
        situation: VehicleSituation.BAIXADA,
        complement: "Teste",
      };

      await sut.update("non-existent-id", updateData);

      const allItems = await sut.listAll();
      expect(allItems).toHaveLength(1);
      expect(allItems[0].name).toBe("Viatura Original");
    });

    it("should not affect other vehicles when updating", async () => {
      await sut.create({
        name: "Segunda Viatura",
        situation: VehicleSituation.BAIXADA,
        complement: "Segundo complemento",
      });
      const allItems = await sut.listAll();
      const secondId = allItems[1].id;

      await sut.update(vehicleId, {
        name: "Primeira Atualizada",
        situation: VehicleSituation.BAIXADA,
        complement: "Complemento Atualizado",
      });

      const secondItem = await sut.findById(secondId);
      expect(secondItem?.name).toBe("Segunda Viatura");
      expect(secondItem?.situation).toBe(VehicleSituation.BAIXADA);
      expect(secondItem?.complement).toBe("Segundo complemento");
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete CRUD operations", async () => {
      // Create
      await sut.create({
        name: "Viatura CRUD",
        situation: VehicleSituation.ATIVA,
        complement: "Teste CRUD",
      });
      let items = await sut.listAll();
      expect(items).toHaveLength(1);
      const vehicleId = items[0].id;

      // Read
      const foundById = await sut.findById(vehicleId);
      expect(foundById).not.toBeNull();

      const foundByName = await sut.findByName("Viatura CRUD");
      expect(foundByName).not.toBeNull();

      // Update
      await sut.update(vehicleId, {
        name: "Viatura CRUD Atualizada",
        situation: VehicleSituation.BAIXADA,
        complement: "Complemento Atualizado",
      });
      const updatedItem = await sut.findById(vehicleId);
      expect(updatedItem?.name).toBe("Viatura CRUD Atualizada");

      // Delete
      await sut.delete(vehicleId);
      items = await sut.listAll();
      expect(items).toHaveLength(0);
    });

    it("should handle concurrent operations correctly", async () => {
      const operations = [
        sut.create({
          name: "Viatura Concorrente 1",
          situation: VehicleSituation.ATIVA,
        }),
        sut.create({
          name: "Viatura Concorrente 2",
          situation: VehicleSituation.BAIXADA,
        }),
        sut.create({
          name: "Viatura Concorrente 3",
          situation: VehicleSituation.ATIVA,
          complement: "Teste",
        }),
      ];

      await Promise.all(operations);

      const result = await sut.listAll();
      expect(result).toHaveLength(3);
    });

    it("should maintain data consistency across operations", async () => {
      // Create initial data
      await sut.create({
        name: "Viatura Consistência",
        situation: VehicleSituation.ATIVA,
        complement: "Inicial",
      });
      await sut.create({
        name: "Outra Viatura",
        situation: VehicleSituation.BAIXADA,
      });

      // Get initial state
      const initialItems = await sut.listAll();
      const vehicleId = initialItems.find(
        (item) => item.name === "Viatura Consistência",
      )?.id;

      // Update and verify
      await sut.update(vehicleId!, {
        name: "Viatura Consistência Atualizada",
        situation: VehicleSituation.BAIXADA,
        complement: "Atualizado",
      });

      // Verify all access methods return consistent data
      const byId = await sut.findById(vehicleId!);
      const byName = await sut.findByName("Viatura Consistência Atualizada");
      const all = await sut.listAll();

      expect(byId?.name).toBe("Viatura Consistência Atualizada");
      expect(byName?.name).toBe("Viatura Consistência Atualizada");
      expect(all.find((item) => item.id === vehicleId)?.name).toBe(
        "Viatura Consistência Atualizada",
      );
    });

    it("should handle multiple vehicles with different situations", async () => {
      await sut.create({
        name: "Viatura Ativa 1",
        situation: VehicleSituation.ATIVA,
        complement: "Ativa",
      });
      await sut.create({
        name: "Viatura Baixada 1",
        situation: VehicleSituation.BAIXADA,
        complement: "Baixada",
      });
      await sut.create({
        name: "Viatura Ativa 2",
        situation: VehicleSituation.ATIVA,
      });
      await sut.create({
        name: "Viatura Baixada 2",
        situation: VehicleSituation.BAIXADA,
      });

      const result = await sut.listAll();

      expect(result).toHaveLength(4);
      expect(
        result.filter((v) => v.situation === VehicleSituation.ATIVA),
      ).toHaveLength(2);
      expect(
        result.filter((v) => v.situation === VehicleSituation.BAIXADA),
      ).toHaveLength(2);
    });
  });
});
