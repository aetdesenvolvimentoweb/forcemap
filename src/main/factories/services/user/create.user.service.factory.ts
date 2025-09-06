import { CreateUserService } from "../../../../application/services";
import { makePasswordHasher } from "../../hasher";
import { makeMilitaryRepository, makeUserRepository } from "../../repositories";
import { makeIdSanitizer, makeUserInputDTOSanitizer } from "../../sanitizers";
import { makeIdValidator, makeUserInputDTOValidator } from "../../validators";

export const makeCreateUserService = (): CreateUserService => {
  const militaryRepository = makeMilitaryRepository();
  const userRepository = makeUserRepository(militaryRepository);
  const idSanitizer = makeIdSanitizer();
  const sanitizer = makeUserInputDTOSanitizer(idSanitizer);
  const idValidator = makeIdValidator();
  const validator = makeUserInputDTOValidator(
    userRepository,
    idValidator,
    militaryRepository,
  );
  const passwordHasher = makePasswordHasher();

  return new CreateUserService({
    userRepository,
    sanitizer,
    validator,
    passwordHasher,
  });
};
