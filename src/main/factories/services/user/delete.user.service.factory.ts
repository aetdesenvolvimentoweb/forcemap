import { DeleteUserService } from "../../../../application/services";
import { GenericServiceFactory } from "../../common/generic-service.factory";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeUserRepository,
} from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeUserIdRegisteredValidator,
} from "../../validators";

export const makeDeleteUserService = (): DeleteUserService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const userRepository = makeUserRepository(militaryRepository);

  return GenericServiceFactory.deleteService({
    ServiceClass: DeleteUserService,
    repositoryMaker: () => userRepository,
    idSanitizerMaker: makeIdSanitizer,
    idValidatorMaker: makeIdValidator,
    idRegisteredValidatorMaker: () =>
      makeUserIdRegisteredValidator(userRepository),
    repositoryKey: "userRepository",
  });
};
