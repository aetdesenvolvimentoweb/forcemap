import { GET } from "@/app/api/military/[id]/route";
import { prismaClient } from "@/backend/infra/adapters/prisma-client";
import { HttpResponse } from "@/backend/presentation/protocols";
import { NextRequest } from "next/server";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const clearDatabase = async (): Promise<void> => {
  await prismaClient.military.deleteMany({}).catch(async () => {
    return;
  });
  await prismaClient.militaryRank.deleteMany({}).catch(async () => {
    return;
  });
};

describe("Military API route", () => {
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

  test("GET a military by id", async () => {
    const request: NextRequest = new NextRequest("http://localhost:3000", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    await prismaClient.military.create({
      data: {
        militaryRankId,
        rg: 1,
        name: "any-name",
        role: "Usuário",
        password: "any-password",
      },
    });
    const military = await prismaClient.military.findUnique({
      where: { rg: 1 },
    });
    const id = military?.id || "";

    const httpResponse: HttpResponse = await GET(request, {
      params: { id },
    }).then(async (data) => await data.json());

    expect(httpResponse.statusCode).toBe(200);
  });
});
