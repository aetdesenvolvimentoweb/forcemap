import { UserDomainServices } from "../../../../application/services/user/user-domain-services.interface";
import { makePasswordHasher } from "../../hasher";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeUserRepository,
} from "../../repositories";
import {
  makeIdSanitizer,
  makeUpdateUserPasswordSanitizer,
  makeUpdateUserRoleSanitizer,
  makeUserCredentialsInputDTOSanitizer,
  makeUserInputDTOSanitizer,
} from "../../sanitizers";
import {
  makeIdValidator,
  makeUpdateUserPasswordValidator,
  makeUpdateUserRoleValidator,
  makeUserCredentialsInputDTOValidator,
  makeUserIdRegisteredValidator,
  makeUserInputDTOValidator,
} from "../../validators";

export const makeUserDomainServices = (): UserDomainServices => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const repository = makeUserRepository(militaryRepository);
  const passwordHasher = makePasswordHasher();

  // Validators
  const idValidator = makeIdValidator();
  const userIdRegisteredValidator = makeUserIdRegisteredValidator(repository);
  const userInputDTOValidator = makeUserInputDTOValidator(
    repository,
    idValidator,
    militaryRepository,
  );
  const userCredentialsInputDTOValidator =
    makeUserCredentialsInputDTOValidator();
  const updateUserPasswordValidator = makeUpdateUserPasswordValidator();
  const updateUserRoleValidator = makeUpdateUserRoleValidator();

  // Sanitizers
  const idSanitizer = makeIdSanitizer();
  const userInputDTOSanitizer = makeUserInputDTOSanitizer(idSanitizer);
  const userCredentialsInputDTOSanitizer =
    makeUserCredentialsInputDTOSanitizer();
  const updateUserPasswordSanitizer = makeUpdateUserPasswordSanitizer();
  const updateUserRoleSanitizer = makeUpdateUserRoleSanitizer();

  return {
    repository,
    passwordHasher,

    // Validators
    idValidator,
    userIdRegisteredValidator,
    userInputDTOValidator,
    userCredentialsInputDTOValidator,
    updateUserPasswordValidator,
    updateUserRoleValidator,

    // Sanitizers
    idSanitizer,
    userInputDTOSanitizer,
    userCredentialsInputDTOSanitizer,
    updateUserPasswordSanitizer,
    updateUserRoleSanitizer,
  };
};
