import { UpdateUserRoleService } from "../../../../application/services";
import { makeMilitaryRepository, makeUserRepository } from "../../repositories";
import { makeIdSanitizer, makeUserRoleSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeUserIdRegisteredValidator,
  makeUserRoleValidator,
} from "../../validators";

export const makeUpdateUserRoleService = (): UpdateUserRoleService => {
  const militaryRepository = makeMilitaryRepository();
  const userRepository = makeUserRepository(militaryRepository);
  const idSanitizer = makeIdSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator = makeUserIdRegisteredValidator(userRepository);
  const userRoleSanitizer = makeUserRoleSanitizer();
  const userRoleValidator = makeUserRoleValidator();

  return new UpdateUserRoleService({
    idRegisteredValidator,
    idSanitizer,
    idValidator,
    userRepository,
    userRoleSanitizer,
    userRoleValidator,
  });
};
