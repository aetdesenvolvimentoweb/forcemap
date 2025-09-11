import { UpdateUserRoleValidatorProtocol } from "../../../../application/protocols";
import { UpdateUserRoleValidator } from "../../../../application/validators";

export const makeUpdateUserRoleValidator =
  (): UpdateUserRoleValidatorProtocol => {
    return new UpdateUserRoleValidator();
  };
