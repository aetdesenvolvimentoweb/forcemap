import { FindByIdUserService } from "../../../../application/services";
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

export const makeFindByIdUserService = (): FindByIdUserService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const userRepository = makeUserRepository(militaryRepository);
  const sanitizer = makeIdSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator = makeUserIdRegisteredValidator(userRepository);

  return new FindByIdUserService({
    userRepository,
    sanitizer,
    idValidator,
    idRegisteredValidator,
  });
};
