import { MilitaryRankRepository } from "@/backend/data/repositories";
import { prismaClient } from "@/backend/infra/adapters/prisma-client";
import { MilitaryRankPrismaRespository } from "@/backend/infra/adapters/prisma/repositories/military-rank";
import { connectionError, operationError } from "@/backend/infra/helpers";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

interface SutResponse {
  sut: MilitaryRankRepository;
}

const makeSut = (): SutResponse => {
  const sut = new MilitaryRankPrismaRespository();

  return { sut };
};

const clearDatabase = async (): Promise<void> => {
  await prismaClient.militaryRank.deleteMany({}).catch(async () => {
    return;
  });
};

describe("MilitaryRankPrismaRepository", () => {
  beforeAll(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  test("should be able to insert a new military rank in the database", async () => {
    const { sut } = makeSut();

    await expect(
      sut.add({ order: 1, abbreviatedName: "Cel" })
    ).resolves.not.toThrow();
  });

  test("should be able to get a military rank in the database by id", async () => {
    const { sut } = makeSut();

    const militaryRank = await sut.getByAbbreviatedName("Cel");
    const id = militaryRank?.id || "";

    await expect(sut.getById(id)).resolves.not.toThrow();
  });

  test("should be able to update a military rank in the database", async () => {
    const { sut } = makeSut();

    const militaryRank = await sut.getByAbbreviatedName("Cel");
    const id = militaryRank?.id || "";

    await expect(
      sut.update({ id, order: 2, abbreviatedName: "TC" })
    ).resolves.not.toThrow();
  });

  test("should be able to delete a military rank in the database by id", async () => {
    const { sut } = makeSut();
    const militaryRank = await sut.getByAbbreviatedName("TC");
    const id = militaryRank?.id || "";

    await expect(sut.delete(id)).resolves.not.toThrow();
  });

  test("should be able to get all military ranks in the database", async () => {
    const { sut } = makeSut();
    await sut.add({ order: 1, abbreviatedName: "Cel" });

    await expect(sut.getAll()).resolves.not.toThrow();
  });

  test("should be throws on connection error", async () => {
    const { sut } = makeSut();
    const mockBrokenConnection = vi.spyOn(prismaClient, "$connect");
    mockBrokenConnection.mockRejectedValueOnce(new Error());

    await expect(sut.add({ order: 1, abbreviatedName: "Cel" })).rejects.toThrow(
      connectionError()
    );

    mockBrokenConnection.mockRestore();
  });

  test("should be throws by error when saving to database", async () => {
    const { sut } = makeSut();
    const mockRecordError = vi.spyOn(prismaClient.militaryRank, "create");
    mockRecordError.mockRejectedValueOnce(new Error());

    await expect(sut.add({ order: 1, abbreviatedName: "Cel" })).rejects.toThrow(
      operationError("criar")
    );

    mockRecordError.mockRestore();
  });

  test("should be throws by error when getting data by abbr in DB", async () => {
    const { sut } = makeSut();
    const mockQueryError = vi.spyOn(prismaClient.militaryRank, "findUnique");
    mockQueryError.mockRejectedValueOnce(new Error());

    await expect(sut.getByAbbreviatedName("Cel")).rejects.toThrow(
      operationError("consultar")
    );

    mockQueryError.mockRestore();
  });

  test("should be throws by error when getting data by id in DB", async () => {
    const { sut } = makeSut();
    const mockQueryError = vi.spyOn(prismaClient.militaryRank, "findFirst");
    mockQueryError.mockRejectedValueOnce(new Error());

    await expect(sut.getById("valid-id")).rejects.toThrow(
      operationError("consultar")
    );

    mockQueryError.mockRestore();
  });

  test("should be throws by error when updating a military rank in DB", async () => {
    const { sut } = makeSut();
    const mockUpdateError = vi.spyOn(prismaClient.militaryRank, "update");
    mockUpdateError.mockRejectedValueOnce(new Error());

    await expect(
      sut.update({ id: "valid-id", order: 2, abbreviatedName: "TC" })
    ).rejects.toThrow(operationError("atualizar"));

    mockUpdateError.mockRestore();
  });

  test("should be throws by error when deleting a military rank in DB", async () => {
    const { sut } = makeSut();
    const mockDeleteError = vi.spyOn(prismaClient.militaryRank, "delete");
    mockDeleteError.mockRejectedValueOnce(new Error());

    await expect(sut.delete("valid-id")).rejects.toThrow(
      operationError("deletar")
    );

    mockDeleteError.mockRestore();
  });
});
