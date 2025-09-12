import { DeleteMilitaryRankService } from "../../../../application/services";
import { GenericServiceFactory } from "../../common/generic-service.factory";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
} from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeMilitaryRankIdRegisteredValidator,
} from "../../validators";
import { makeMilitaryRankInUseValidator } from "../../validators/military-rank/military-rank.in-use.validator.factory";

export const makeDeleteMilitaryRankService = (): DeleteMilitaryRankService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);

  return GenericServiceFactory.deleteService({
    ServiceClass: DeleteMilitaryRankService,
    repositoryMaker: () => militaryRankRepository,
    idSanitizerMaker: makeIdSanitizer,
    idValidatorMaker: makeIdValidator,
    idRegisteredValidatorMaker: () =>
      makeMilitaryRankIdRegisteredValidator(militaryRankRepository),
    inUseValidatorMaker: () =>
      makeMilitaryRankInUseValidator(militaryRepository),
    repositoryKey: "militaryRankRepository",
  });
};
