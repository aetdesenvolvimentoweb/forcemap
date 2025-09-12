import { CreateMilitaryService } from "../../../../application/services";
import { GenericServiceFactory } from "../../common/generic-service.factory";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
} from "../../repositories";
import { makeMilitaryInputDTOSanitizer } from "../../sanitizers";
import { makeMilitaryInputDTOValidator } from "../../validators";

export const makeCreateMilitaryService = (): CreateMilitaryService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);

  return GenericServiceFactory.createService({
    ServiceClass: CreateMilitaryService,
    repositoryMaker: () => militaryRepository,
    sanitizerMaker: makeMilitaryInputDTOSanitizer,
    validatorMaker: () => makeMilitaryInputDTOValidator(militaryRepository),
    repositoryKey: "militaryRepository",
  });
};
