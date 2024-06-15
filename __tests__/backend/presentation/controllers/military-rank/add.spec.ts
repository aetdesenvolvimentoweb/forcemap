import {
  IdValidatorStub,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import { duplicatedKeyError, missingParamError } from "@/backend/data/helpers";
import { MilitaryRankRepository } from "@/backend/data/repositories";
import { AddMilitaryRankService } from "@/backend/data/services";
import { MilitaryRankValidator } from "@/backend/data/validators";
import { MilitaryRankProps } from "@/backend/domain/entities";
import { AddMilitaryRankController } from "@/backend/presentation/controllers";
import { serverError } from "@/backend/presentation/helpers";
import { HttpRequest, HttpResponse } from "@/backend/presentation/protocols";
import { describe, expect, test, vi } from "vitest";

interface SutResponse {
  repository: MilitaryRankRepository;
  sut: AddMilitaryRankController;
}

const makeSut = (): SutResponse => {
  const repository = new MilitaryRankInMemoryRepository();
  const idValidator = new IdValidatorStub();
  const validator = new MilitaryRankValidator({
    idValidator,
    repository,
  });
  const addMilitaryRankService = new AddMilitaryRankService({
    repository,
    validator,
  });

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

  test("should be return 400 on missing param order", async () => {
    const { sut } = makeSut();

    const httpRequest: HttpRequest<MilitaryRankProps> = {
      // @ts-expect-error
      body: {
        abbreviatedName: "Cel",
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toBe(
      missingParamError("ordem").message
    );
  });

  test("should be return 400 on missing param abbreviated name", async () => {
    const { sut } = makeSut();

    const httpRequest: HttpRequest<MilitaryRankProps> = {
      // @ts-expect-error
      body: {
        order: 1,
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toBe(
      missingParamError("nome abreviado").message
    );
  });

  test("should be return 400 on duplicated key", async () => {
    const { sut } = makeSut();

    await sut.handle({
      body: {
        order: 1,
        abbreviatedName: "Cel",
      },
    });

    const httpResponse: HttpResponse = await sut.handle({
      body: {
        order: 2,
        abbreviatedName: "Cel",
      },
    });

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toBe(
      duplicatedKeyError("nome abreviado").message
    );
  });

  test("should be return 500 on server error", async () => {
    const { repository, sut } = makeSut();
    const mockServerError = vi.spyOn(repository, "add");
    mockServerError.mockRejectedValueOnce(new Error());

    const httpRequest: HttpRequest = {
      body: {
        order: 2,
        abbreviatedName: "Cel",
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body.errorMessage).toBe(
      serverError().body.errorMessage
    );

    mockServerError.mockRestore();
  });
});
