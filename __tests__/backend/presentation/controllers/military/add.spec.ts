import {
  MilitaryInMemoryRepository,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "@/backend/data/repositories";
import { AddMilitaryService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { MilitaryProps } from "@/backend/domain/entities";
import { AddMilitaryController } from "@/backend/presentation/controllers";
import { HttpRequest, HttpResponse } from "@/backend/presentation/protocols";
import { describe, expect, test } from "vitest";

interface SutResponse {
  militaryRepository: MilitaryRepository;
  militaryRankRepository: MilitaryRankRepository;
  sut: AddMilitaryController;
}

const makeSut = (): SutResponse => {
  const militaryRankRepository: MilitaryRankRepository =
    new MilitaryRankInMemoryRepository();
  const militaryRepository: MilitaryRepository = new MilitaryInMemoryRepository(
    militaryRankRepository
  );
  const validator = new MilitaryValidator({});
  const addMilitaryService = new AddMilitaryService({
    validator,
    repository: militaryRepository,
  });

  const sut = new AddMilitaryController(addMilitaryService);

  return { militaryRepository, militaryRankRepository, sut };
};

describe("AddMilitaryController", () => {
  test("should be return 201 on success", async () => {
    const { militaryRankRepository, sut } = makeSut();

    await militaryRankRepository.add({
      order: 1,
      abbreviatedName: "Cel",
    });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    const httpRequest: HttpRequest<MilitaryProps> = {
      body: {
        militaryRankId,
        rg: 1,
        name: "any-name",
        role: "Usuário",
        password: "any-password",
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(201);
  });
});
