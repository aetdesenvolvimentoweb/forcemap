import { MilitaryRepository } from "@/backend/data/repositories";
import { prismaClient } from "@/backend/infra/adapters/prisma-client";
import {
  MilitaryPrismaRespository,
  MilitaryRankPrismaRespository,
} from "@/backend/infra/adapters/prisma/repositories";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

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
});
