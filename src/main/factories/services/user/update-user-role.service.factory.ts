import { UpdateUserRoleService } from "../../../../application/services";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeUserRepository,
} from "../../repositories";
import { makeIdSanitizer, makeUpdateUserRoleSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeUpdateUserRoleValidator,
  makeUserIdRegisteredValidator,
} from "../../validators";

export const makeUpdateUserRoleService = (): UpdateUserRoleService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const userRepository = makeUserRepository(militaryRepository);
  const idSanitizer = makeIdSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator = makeUserIdRegisteredValidator(userRepository);
  const updateUserRoleSanitizer = makeUpdateUserRoleSanitizer();
  const updateUserRoleValidator = makeUpdateUserRoleValidator();

  return new UpdateUserRoleService({
    idRegisteredValidator,
    idSanitizer,
    idValidator,
    userRepository,
    updateUserRoleSanitizer,
    updateUserRoleValidator,
  });
};
