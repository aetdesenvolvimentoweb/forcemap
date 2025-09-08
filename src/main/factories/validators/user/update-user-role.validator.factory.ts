import { UpdateUserRoleValidatorProtocol } from "../../../../application/protocols";
import { UpdateUserRoleValidator } from "../../../../application/validators";

export const makeUserRoleValidator = (): UpdateUserRoleValidatorProtocol => {
  return new UpdateUserRoleValidator();
};
