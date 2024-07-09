import {
  IdValidatorStub,
  MilitaryInMemoryRepository,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "@/backend/data/repositories";
import { UpdateMilitaryPasswordService } from "@/backend/data/services";
import { MilitaryValidator } from "@/backend/data/validators";
import { UpdateMilitaryPasswordProps } from "@/backend/domain/entities";
import { UpdateMilitaryPasswordController } from "@/backend/presentation/controllers";
import { HttpRequest, HttpResponse } from "@/backend/presentation/protocols";
import { describe, expect, test } from "vitest";

interface SutResponse {
  militaryRankRepository: MilitaryRankRepository;
  militaryRepository: MilitaryRepository;
  sut: UpdateMilitaryPasswordController;
}

const makeSut = (): SutResponse => {
  const militaryRankRepository: MilitaryRankRepository =
    new MilitaryRankInMemoryRepository();
  const militaryRepository: MilitaryRepository = new MilitaryInMemoryRepository(
    militaryRankRepository
  );
  const idValidator = new IdValidatorStub();
  const validator = new MilitaryValidator({
    idValidator,
    militaryRankRepository,
    militaryRepository,
  });
  const updateMilitaryPasswordService = new UpdateMilitaryPasswordService({
    repository: militaryRepository,
    validator,
  });

  const sut = new UpdateMilitaryPasswordController(
    updateMilitaryPasswordService
  );

  return { militaryRankRepository, militaryRepository, sut };
};

describe("UpdateMilitaryPasswordController", () => {
  test("should be return 200 on success", async () => {
    const { militaryRankRepository, militaryRepository, sut } = makeSut();

    await militaryRankRepository.add({
      order: 1,
      abbreviatedName: "Cel",
    });
    const militaryRank =
      await militaryRankRepository.getByAbbreviatedName("Cel");
    const militaryRankId = militaryRank?.id || "";

    await militaryRepository.add({
      militaryRankId,
      rg: 1,
      name: "any-name",
      role: "Usuário",
      password: "current-password",
    });
    const military = await militaryRepository.getByRg(1);
    const id = military?.id || "";

    const httpRequest: HttpRequest<Omit<UpdateMilitaryPasswordProps, "id">> = {
      body: {
        currentPassword: "current-password",
        newPassword: "any-new-password",
      },
      params: {
        id,
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(200);
  });
});
