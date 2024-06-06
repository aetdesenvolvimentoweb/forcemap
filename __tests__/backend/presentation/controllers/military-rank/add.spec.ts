import { MilitaryRankInMemoryRepository } from "@/../__mocks__";
import { MilitaryRankRepository } from "@/backend/data/repositories";
import { AddMilitaryRankService } from "@/backend/data/services";
import { AddMilitaryRankController } from "@/backend/presentation/controllers";
import { HttpRequest, HttpResponse } from "@/backend/presentation/protocols";
import { describe, expect, test } from "vitest";

interface SutResponse {
  repository: MilitaryRankRepository;
  sut: AddMilitaryRankController;
}

const makeSut = (): SutResponse => {
  const repository: MilitaryRankRepository =
    new MilitaryRankInMemoryRepository();
  const addMilitaryRankService = new AddMilitaryRankService(repository);

  const sut = new AddMilitaryRankController(addMilitaryRankService);

  return { repository, sut };
};

describe("AddMilitaryRankController", () => {
  test("should be return 201 on success", async () => {
    const { sut } = makeSut();

    const httpRequest: HttpRequest = {
      body: {
        order: 1,
        abbreviatedName: "Cel",
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(201);
  });
});
