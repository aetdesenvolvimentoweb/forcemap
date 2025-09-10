import { UserValidationService } from "../../../../application/services/user/user-validation.service";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeUserRepository,
} from "../../repositories";
import {
  makeIdValidator,
  makeUpdateUserPasswordValidator,
  makeUserIdRegisteredValidator,
  makeUserInputDTOValidator,
  makeUserRoleValidator,
} from "../../validators";

export const makeUserValidationService = (): UserValidationService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const userRepository = makeUserRepository(militaryRepository);
  const idValidator = makeIdValidator();
  const idRegisteredValidator = makeUserIdRegisteredValidator(userRepository);
  const userInputDTOValidator = makeUserInputDTOValidator(
    userRepository,
    idValidator,
    militaryRepository,
  );
  const updateUserPasswordValidator = makeUpdateUserPasswordValidator();
  const updateUserRoleValidator = makeUserRoleValidator();

  return new UserValidationService({
    idValidator,
    idRegisteredValidator,
    userInputDTOValidator,
    updateUserPasswordValidator,
    updateUserRoleValidator,
  });
};
