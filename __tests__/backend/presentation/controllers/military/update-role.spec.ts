import {
  MilitaryInMemoryRepository,
  MilitaryRankInMemoryRepository,
} from "@/../__mocks__";
import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "@/backend/data/repositories";
import { UpdateMilitaryRoleService } from "@/backend/data/services";
import { UpdateMilitaryRoleProps } from "@/backend/domain/entities";
import { UpdateMilitaryRoleController } from "@/backend/presentation/controllers";
import { HttpRequest, HttpResponse } from "@/backend/presentation/protocols";
import { describe, expect, test } from "vitest";

interface SutResponse {
  militaryRankRepository: MilitaryRankRepository;
  militaryRepository: MilitaryRepository;
  sut: UpdateMilitaryRoleController;
}

const makeSut = (): SutResponse => {
  const militaryRankRepository: MilitaryRankRepository =
    new MilitaryRankInMemoryRepository();
  const militaryRepository: MilitaryRepository = new MilitaryInMemoryRepository(
    militaryRankRepository
  );
  const updateMilitaryRoleService = new UpdateMilitaryRoleService({
    repository: militaryRepository,
  });

  const sut = new UpdateMilitaryRoleController(updateMilitaryRoleService);

  return { militaryRankRepository, militaryRepository, sut };
};

describe("UpdateMilitaryRoleController", () => {
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

    const httpRequest: HttpRequest<Omit<UpdateMilitaryRoleProps, "id">> = {
      body: {
        newRole: "Administrador",
      },
      params: {
        id,
      },
    };

    const httpResponse: HttpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(200);
  });
});
