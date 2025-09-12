import { DeleteMilitaryService } from "../../../../application/services";
import { GenericServiceFactory } from "../../common/generic-service.factory";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeUserRepository,
} from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeMilitaryDeletionPermissionValidator,
  makeMilitaryIdRegisteredValidator,
  makeMilitaryInUseValidator,
} from "../../validators";

export const makeDeleteMilitaryService = (): DeleteMilitaryService => {
  // Complex dependencies that need custom setup
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const userRepository = makeUserRepository(militaryRepository);

  return GenericServiceFactory.deleteService({
    ServiceClass: DeleteMilitaryService,
    repositoryMaker: () => militaryRepository,
    idSanitizerMaker: makeIdSanitizer,
    idValidatorMaker: makeIdValidator,
    idRegisteredValidatorMaker: () =>
      makeMilitaryIdRegisteredValidator(militaryRepository),
    inUseValidatorMaker: () => makeMilitaryInUseValidator(userRepository),
    deletionPermissionValidatorMaker: makeMilitaryDeletionPermissionValidator,
    repositoryKey: "militaryRepository",
  });
};
