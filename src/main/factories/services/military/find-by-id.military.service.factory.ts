import { FindByIdMilitaryService } from "../../../../application/services";
import { GenericServiceFactory } from "../../common/generic-service.factory";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
} from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeMilitaryIdRegisteredValidator,
} from "../../validators";

export const makeFindByIdMilitaryService = (): FindByIdMilitaryService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);

  return GenericServiceFactory.findByIdService({
    ServiceClass: FindByIdMilitaryService,
    repositoryMaker: () => militaryRepository,
    idSanitizerMaker: makeIdSanitizer,
    idValidatorMaker: makeIdValidator,
    idRegisteredValidatorMaker: () =>
      makeMilitaryIdRegisteredValidator(militaryRepository),
    repositoryKey: "militaryRepository",
  });
};
