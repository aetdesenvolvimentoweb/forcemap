import { MilitaryRankRepository } from "@/backend/data/repositories";
import { prismaClient } from "@/backend/infra/adapters/prisma-client";
import { MilitaryRankPrismaRespository } from "@/backend/infra/adapters/prisma/repositories/military-rank";
import { connectionError } from "@/backend/infra/helpers";
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

  test("should be throws on connection error", async () => {
    const { sut } = makeSut();
    const mockBrokenConnection = vi.spyOn(prismaClient, "$connect");
    mockBrokenConnection.mockRejectedValueOnce(new Error());

    await expect(sut.add({ order: 1, abbreviatedName: "Cel" })).rejects.toThrow(
      connectionError()
    );

    mockBrokenConnection.mockRestore();
  });
});
