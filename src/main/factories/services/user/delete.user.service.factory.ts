import { DeleteUserService } from "../../../../application/services";
import { makeMilitaryRepository, makeUserRepository } from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeUserIdRegisteredValidator,
} from "../../validators";

export const makeDeleteUserService = (): DeleteUserService => {
  const militaryRepository = makeMilitaryRepository();
  const userRepository = makeUserRepository(militaryRepository);
  const sanitizer = makeIdSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator = makeUserIdRegisteredValidator(userRepository);

  return new DeleteUserService({
    userRepository,
    sanitizer,
    idValidator,
    idRegisteredValidator,
  });
};
