import { MilitaryRepository } from "@/backend/data/repositories";
import { prismaClient } from "@/backend/infra/adapters/prisma-client";
import {
  MilitaryPrismaRespository,
  MilitaryRankPrismaRespository,
} from "@/backend/infra/adapters/prisma/repositories";
import { connectionError, operationError } from "@/backend/infra/helpers";
import { ObjectId } from "mongodb";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

interface SutResponse {
  militaryRankRepository: MilitaryRankPrismaRespository;
  sut: MilitaryRepository;
}

const makeSut = (): SutResponse => {
  const militaryRankRepository = new MilitaryRankPrismaRespository();
  const sut = new MilitaryPrismaRespository();

  return { militaryRankRepository, sut };
};

const clearDatabase = async (): Promise<void> => {
  await prismaClient.military.deleteMany({}).catch(async () => {
    return;
  });
  await prismaClient.militaryRank.deleteMany({}).catch(async () => {
    return;
  });
};

describe("MilitaryPrismaRepository", () => {
  let militaryRankId: string = "";

  beforeAll(async () => {
    await clearDatabase();

    await prismaClient.militaryRank.create({
      data: {
        order: 1,
        abbreviatedName: "Cel",
      },
    });
    const militaryRank = await prismaClient.militaryRank.findUnique({
      where: {
        abbreviatedName: "Cel",
      },
    });
    militaryRankId = militaryRank?.id || "";
  });

  afterAll(async () => {
    await clearDatabase();
  });

  test("should be able to insert a new military in the database", async () => {
    const { sut } = makeSut();

    await expect(
      sut.add({
        militaryRankId,
        rg: 1,
        name: "any-name",
        password: "any-password",
        role: "Usuário",
      })
    ).resolves.not.toThrow();
  });

  test("should be able to get all registereds military in the database", async () => {
    const { sut } = makeSut();

    await expect(sut.getAll()).resolves.not.toThrow();
  });

  test("should be able to get a military in the database by id", async () => {
    const { sut } = makeSut();

    const military = await sut.getByRg(1);
    const id = military?.id || "";

    await expect(sut.getById(id)).resolves.not.toThrow();
  });

  test("should be able to return null if military not found", async () => {
    const { sut } = makeSut();

    const id = new ObjectId().toString();

    expect(await sut.getById(id)).toEqual(null);
  });

  test("should be able to get a military in the database by RG", async () => {
    const { sut } = makeSut();

    await expect(sut.getByRg(1)).resolves.not.toThrow();
  });

  test("should be able to delete a military in the database by id", async () => {
    const { sut } = makeSut();
    const military = await sut.getByRg(1);
    const id = military?.id || "";

    await expect(sut.delete(id)).resolves.not.toThrow();
  });

  test("should be throws on connection error", async () => {
    const { sut } = makeSut();
    const mockBrokenConnection = vi.spyOn(prismaClient, "$connect");
    mockBrokenConnection.mockRejectedValueOnce(new Error());

    await expect(
      sut.add({
        militaryRankId,
        rg: 1,
        name: "any-name",
        password: "any-password",
        role: "Usuário",
      })
    ).rejects.toThrow(connectionError());

    mockBrokenConnection.mockRestore();
  });

  test("should be throws by error when saving to database", async () => {
    const { sut } = makeSut();
    const mockRecordError = vi.spyOn(prismaClient.military, "create");
    mockRecordError.mockRejectedValueOnce(new Error());

    await expect(
      sut.add({
        militaryRankId,
        rg: 1,
        name: "any-name",
        password: "any-password",
        role: "Usuário",
      })
    ).rejects.toThrow(operationError("criar"));

    mockRecordError.mockRestore();
  });

  test("should be throws by error when getting from database by ID", async () => {
    const { sut } = makeSut();
    const mockQueryError = vi.spyOn(prismaClient.military, "findFirst");
    mockQueryError.mockRejectedValueOnce(new Error());

    await expect(sut.getById("valid-id")).rejects.toThrow(
      operationError("consultar")
    );

    mockQueryError.mockRestore();
  });

  test("should be throws by error when getting from database by RG", async () => {
    const { sut } = makeSut();
    const mockQueryError = vi.spyOn(prismaClient.military, "findUnique");
    mockQueryError.mockRejectedValueOnce(new Error());

    await expect(sut.getByRg(1)).rejects.toThrow(operationError("consultar"));

    mockQueryError.mockRestore();
  });

  test("should be throws by error when deleting in the database by ID", async () => {
    const { sut } = makeSut();
    const mockDeleteError = vi.spyOn(prismaClient.military, "delete");
    mockDeleteError.mockRejectedValueOnce(new Error());

    await expect(sut.delete("valid-id")).rejects.toThrow(
      operationError("deletar")
    );

    mockDeleteError.mockRestore();
  });

  test("should be throws by error when getting all registers from database", async () => {
    const { sut } = makeSut();
    const mockQueryError = vi.spyOn(prismaClient.military, "findMany");
    mockQueryError.mockRejectedValueOnce(new Error());

    await expect(sut.getAll()).rejects.toThrow(operationError("consultar"));

    mockQueryError.mockRestore();
  });
});
