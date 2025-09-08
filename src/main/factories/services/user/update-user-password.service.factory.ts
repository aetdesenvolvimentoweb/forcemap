import { UpdateUserPasswordService } from "../../../../application/services";
import { makePasswordHasher } from "../../hasher";
import { makeMilitaryRepository, makeUserRepository } from "../../repositories";
import {
  makeIdSanitizer,
  makeUpdateUserPasswordSanitizer,
} from "../../sanitizers";
import {
  makeIdValidator,
  makeUpdateUserPasswordValidator,
  makeUserIdRegisteredValidator,
} from "../../validators";

export const makeUpdateUserPasswordService = (): UpdateUserPasswordService => {
  const militaryRepository = makeMilitaryRepository();
  const userRepository = makeUserRepository(militaryRepository);
  const idSanitizer = makeIdSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator = makeUserIdRegisteredValidator(userRepository);
  const updateUserPasswordSanitizer = makeUpdateUserPasswordSanitizer();
  const updateUserPasswordValidator = makeUpdateUserPasswordValidator();
  const passwordHasher = makePasswordHasher();

  return new UpdateUserPasswordService({
    idRegisteredValidator,
    idSanitizer,
    idValidator,
    passwordHasher,
    updateUserPasswordSanitizer,
    updateUserPasswordValidator,
    userRepository,
  });
};
