import { UserRoleValidatorProtocol } from "../../../../application/protocols";
import { UserRoleValidator } from "../../../../application/validators";

export const makeUserRoleValidator = (): UserRoleValidatorProtocol => {
  return new UserRoleValidator();
};
