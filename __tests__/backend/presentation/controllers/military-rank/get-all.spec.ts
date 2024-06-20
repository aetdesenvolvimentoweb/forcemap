import { MilitaryRankInMemoryRepository } from "@/../__mocks__";
import { MilitaryRankRepository } from "@/backend/data/repositories";
import { GetAllMilitaryRanksService } from "@/backend/data/services";
import { GetAllMilitaryRanksController } from "@/backend/presentation/controllers";
import { serverError } from "@/backend/presentation/helpers";
import { HttpRequest } from "@/backend/presentation/protocols";
import { describe, expect, test, vi } from "vitest";

interface SutResponse {
  repository: MilitaryRankRepository;
  sut: GetAllMilitaryRanksController;
}

const makeSut = (): SutResponse => {
  const repository: MilitaryRankRepository =
    new MilitaryRankInMemoryRepository();
  const getAllMilitaryRanksService = new GetAllMilitaryRanksService(repository);

  const sut = new GetAllMilitaryRanksController(getAllMilitaryRanksService);

  return { repository, sut };
};

describe("GetAllMilitaryRanksController", () => {
  test("should be return 200 on success", async () => {
    const { repository, sut } = makeSut();

    await repository.add({
      order: 1,
      abbreviatedName: "Cel",
    });

    const httpRequest: HttpRequest = {
      body: {},
    };

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(200);
    expect(Array.isArray(httpResponse.body.data)).toBeTruthy();
  });
  test("should be return 500 on server error", async () => {
    const { repository, sut } = makeSut();

    const mockServerError = vi.spyOn(repository, "getAll");
    mockServerError.mockRejectedValueOnce(new Error());

    const httpRequest: HttpRequest = {
      body: {},
    };

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body.errorMessage).toEqual(
      serverError().body.errorMessage
    );

    mockServerError.mockRestore();
  });
});
