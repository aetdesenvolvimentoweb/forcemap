import { UserSanitizationService } from "../../../../application/services/user/user-sanitization.service";
import {
  makeIdSanitizer,
  makeUpdateUserPasswordSanitizer,
  makeUserCredentialsInputDTOSanitizer,
  makeUserInputDTOSanitizer,
  makeUserRoleSanitizer,
} from "../../sanitizers";

export const makeUserSanitizationService = (): UserSanitizationService => {
  const idSanitizer = makeIdSanitizer();
  const userInputDTOSanitizer = makeUserInputDTOSanitizer(idSanitizer);
  const userCredentialsInputDTOSanitizer =
    makeUserCredentialsInputDTOSanitizer();
  const updateUserPasswordSanitizer = makeUpdateUserPasswordSanitizer();
  const updateUserRoleSanitizer = makeUserRoleSanitizer();

  return new UserSanitizationService({
    idSanitizer,
    userInputDTOSanitizer,
    userCredentialsInputDTOSanitizer,
    updateUserPasswordSanitizer,
    updateUserRoleSanitizer,
  });
};
