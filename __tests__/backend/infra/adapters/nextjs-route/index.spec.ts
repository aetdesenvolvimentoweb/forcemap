import { MilitaryRankInMemoryRepository } from "@/../__mocks__/repositories";
import { AddMilitaryRankService } from "@/backend/data/services";
import { MilitaryRankValidator } from "@/backend/data/validators";
import { nextjsRouteAdapter } from "@/backend/infra/adapters/nextjs-route";
import { AddMilitaryRankController } from "@/backend/presentation/controllers";
import { HttpResponse } from "@/backend/presentation/protocols";
import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";

describe("nextjsRouteAdapter", () => {
  test("should be return false to success on missing param order", async () => {
    const repository = new MilitaryRankInMemoryRepository();
    const validator = new MilitaryRankValidator();
    const addMilitaryRankService = new AddMilitaryRankService({
      repository,
      validator,
    });
    const controller = new AddMilitaryRankController(addMilitaryRankService);

    const request = new NextRequest("http://localhost:3000/military-rank", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ abbreviatedName: "Cel" }),
    });

    const sutResponse: HttpResponse = await nextjsRouteAdapter({
      controller,
      request,
    }).then(async (data) => {
      return await data.json();
    });

    expect(sutResponse.body.success).toBeFalsy();
  });
});
