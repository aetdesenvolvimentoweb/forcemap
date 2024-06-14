import { MilitaryRankInMemoryRepository } from "@/../__mocks__";
import { missingParamError } from "@/backend/data/helpers";
import { MilitaryRankRepository } from "@/backend/data/repositories";
import { AddMilitaryRankService } from "@/backend/data/services";
import { MilitaryRankValidator } from "@/backend/data/validators";
import { MilitaryRankProps } from "@/backend/domain";
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
  const validator: MilitaryRankValidator = new MilitaryRankValidator();
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

    console.log("httpResponse", httpResponse);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body.errorMessage).toBe(
      missingParamError("ordem").message
    );
  });
});
