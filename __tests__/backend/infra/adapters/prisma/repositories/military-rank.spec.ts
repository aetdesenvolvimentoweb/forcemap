import { MilitaryRankRepository } from "@/backend/data/repositories";
import { prismaClient } from "@/backend/infra/adapters/prisma-client";
import { MilitaryRankPrismaRespository } from "@/backend/infra/adapters/prisma/repositories/military-rank";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

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
});