import { UpdateUserRoleService } from "../../../../application/services";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeUserRepository,
} from "../../repositories";
import { makeIdSanitizer, makeUserRoleSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeUserIdRegisteredValidator,
  makeUserRoleValidator,
} from "../../validators";

export const makeUpdateUserRoleService = (): UpdateUserRoleService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const userRepository = makeUserRepository(militaryRepository);
  const idSanitizer = makeIdSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator = makeUserIdRegisteredValidator(userRepository);
  const updateUserRoleSanitizer = makeUserRoleSanitizer();
  const updateUserRoleValidator = makeUserRoleValidator();

  return new UpdateUserRoleService({
    idRegisteredValidator,
    idSanitizer,
    idValidator,
    userRepository,
    updateUserRoleSanitizer,
    updateUserRoleValidator,
  });
};
