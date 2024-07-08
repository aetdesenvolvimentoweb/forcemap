import { PATCH } from "@/app/api/military/[id]/role/route";
import { prismaClient } from "@/backend/infra/adapters";
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

describe("Military update role API route", () => {
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

  test("PATCH should be able to update a military role", async () => {
    const military = await prismaClient.military.create({
      data: {
        militaryRankId,
        rg: 2,
        name: "any-name",
        role: "Usuário",
        password: "any-password",
      },
    });
    const id = military?.id || "";

    const request: NextRequest = new NextRequest("http://localhost:3000", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        newRole: "Administrador",
      }),
    });

    const httpResponse: HttpResponse = await PATCH(request, {
      params: { id },
    }).then(async (data) => await data.json());

    expect(httpResponse.statusCode).toBe(200);
  });
});
