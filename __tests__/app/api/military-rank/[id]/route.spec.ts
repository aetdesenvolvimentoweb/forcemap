import { DELETE, GET, PUT } from "@/app/api/military-rank/[id]/route";
import { MilitaryRank } from "@/backend/domain/entities";
import { prismaClient } from "@/backend/infra/adapters";
import { HttpResponse } from "@/backend/presentation/protocols";
import { NextRequest } from "next/server";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const clearDatabase = async (): Promise<void> => {
  await prismaClient.militaryRank.deleteMany({}).catch(async () => {
    return;
  });
};

describe("Military Rank API route", () => {
  beforeAll(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  test("GET should be able to get a military rank by ID", async () => {
    const request: NextRequest = new NextRequest("http://localhost:3000", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    await prismaClient.militaryRank.create({
      data: {
        order: 1,
        abbreviatedName: "Cel",
      },
    });

    const militaryRank = await prismaClient.militaryRank.findUnique({
      where: { abbreviatedName: "Cel" },
    });

    const id = militaryRank?.id || "";

    const httpResponse: HttpResponse<MilitaryRank | null> = await GET(request, {
      params: { id },
    }).then(async (data) => await data.json());

    expect(httpResponse.statusCode).toBe(200);
  });

  test("PUT should be able to update a military rank", async () => {
    const request: NextRequest = new NextRequest("http://localhost:3000", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order: 2,
        abbreviatedName: "TC",
      }),
    });

    const militaryRank = await prismaClient.militaryRank.findUnique({
      where: { abbreviatedName: "Cel" },
    });
    const id = militaryRank?.id || "";

    const httpResponse: HttpResponse = await PUT(request, {
      params: { id },
    }).then(async (data) => await data.json());

    expect(httpResponse.statusCode).toBe(200);
  });

  test("DELETE should be able to delete a military rank", async () => {
    const request: NextRequest = new NextRequest("http://localhost:3000", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const militaryRank = await prismaClient.militaryRank.findUnique({
      where: { abbreviatedName: "TC" },
    });
    const id = militaryRank?.id || "";

    const httpResponse: HttpResponse = await DELETE(request, {
      params: { id },
    }).then(async (data) => await data.json());

    expect(httpResponse.statusCode).toBe(200);
  });
});
