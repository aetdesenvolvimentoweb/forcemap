import { PATCH } from "@/app/api/military/[id]/password/route";
import { prismaClient } from "@/backend/infra/adapters";
import { BcryptEncrypterAdapter } from "@/backend/infra/adapters/bcrypt/encrypter";
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

describe("Military update password API route", () => {
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

  test("PATCH should be able to update a military password", async () => {
    const encrypter = new BcryptEncrypterAdapter();
    const military = await prismaClient.military.create({
      data: {
        militaryRankId,
        rg: 1,
        name: "any-name",
        role: "Usuário",
        password: await encrypter.encrypt("any-password"),
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
        currentPassword: "any-password",
        newPassword: "another-password",
      }),
    });

    const httpResponse: HttpResponse = await PATCH(request, {
      params: { id },
    }).then(async (data) => await data.json());

    expect(httpResponse.statusCode).toBe(200);
  });
});
