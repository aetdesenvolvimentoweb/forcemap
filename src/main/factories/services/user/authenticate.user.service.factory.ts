import { AuthenticateUserService } from "../../../../application/services";
import { AuthenticateUserUseCase } from "../../../../domain/use-cases";
import { makePasswordHasher } from "../../hasher";
import { makeMilitaryRepository, makeUserRepository } from "../../repositories";
import { makeUserCredentialsInputDTOSanitizer } from "../../sanitizers";
import { makeUserCredentialsInputDTOValidator } from "../../validators";

export const makeAuthenticateUserService = (): AuthenticateUserUseCase => {
  const militaryRepository = makeMilitaryRepository();
  const userRepository = makeUserRepository(militaryRepository);
  const sanitizer = makeUserCredentialsInputDTOSanitizer();
  const validator = makeUserCredentialsInputDTOValidator();
  const passwordHasher = makePasswordHasher();

  return new AuthenticateUserService({
    militaryRepository,
    userRepository,
    sanitizer,
    validator,
    passwordHasher,
  });
};
