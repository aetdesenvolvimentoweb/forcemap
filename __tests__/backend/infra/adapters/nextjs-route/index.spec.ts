import { MilitaryRankInMemoryRepository } from "@/../__mocks__/repositories";
import {
  AddMilitaryRankService,
  GetMilitaryRankByIdService,
} from "@/backend/data/services";
import { MilitaryRankValidator } from "@/backend/data/validators";
import { nextjsRouteAdapter } from "@/backend/infra/adapters/nextjs-route";
import {
  AddMilitaryRankController,
  GetMilitaryRankByIdController,
} from "@/backend/presentation/controllers";
import { HttpResponse } from "@/backend/presentation/protocols";
import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";
import { IdValidatorStub } from "../../../../../__mocks__";

describe("nextjsRouteAdapter", () => {
  test("should be return false to success on missing param order", async () => {
    const repository = new MilitaryRankInMemoryRepository();
    const idValidator = new IdValidatorStub();
    const validator = new MilitaryRankValidator({ idValidator, repository });
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

  test("should be return a military rank by id", async () => {
    const repository = new MilitaryRankInMemoryRepository();
    const idValidator = new IdValidatorStub();
    const validator = new MilitaryRankValidator({ idValidator, repository });
    const getMilitaryRankByIdService = new GetMilitaryRankByIdService({
      repository,
      validator,
    });
    const controller = new GetMilitaryRankByIdController(
      getMilitaryRankByIdService
    );

    await repository.add({ order: 1, abbreviatedName: "Cel" });
    const militaryRank = await repository.getByAbbreviatedName("Cel");
    const id = militaryRank?.id || "";

    const request = new NextRequest("http://localhost:3000/military-rank", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const sutResponse: HttpResponse = await nextjsRouteAdapter({
      controller,
      request,
      dynamicParams: { id },
    }).then(async (data) => {
      return await data.json();
    });

    expect(sutResponse.body.data).toEqual(militaryRank);
  });
});
