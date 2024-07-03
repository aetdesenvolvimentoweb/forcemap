import { GET, POST } from "@/app/api/military-rank/route";
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

  test("POST a new military rank", async () => {
    const request: NextRequest = new NextRequest("http://localhost:3000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order: 1,
        abbreviatedName: "Cel",
      }),
    });

    const httpResponse: HttpResponse = await POST(request).then((res) =>
      res.json()
    );

    expect(httpResponse.statusCode).toBe(201);
  });

  test("GET all military ranks", async () => {
    const request: NextRequest = new NextRequest("http://localhost:3000", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const httpResponse: HttpResponse = await GET(request).then((res) =>
      res.json()
    );

    expect(httpResponse.statusCode).toBe(200);
  });
});
