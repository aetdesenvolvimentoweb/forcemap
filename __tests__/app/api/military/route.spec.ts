import { POST } from "@/app/api/military/route";
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

  test("POST", async () => {
    const request: NextRequest = new NextRequest("http://localhost:3000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        militaryRankId,
        rg: 1,
        name: "any-name",
        role: "Usuário",
        password: "any-password",
      }),
    });

    const httpResponse: HttpResponse = await POST(request).then((res) =>
      res.json()
    );

    expect(httpResponse.statusCode).toBe(201);
  });
});
