import { UpdateUserPasswordValidatorProtocol } from "../../../../application/protocols";
import { UpdateUserPasswordValidator } from "../../../../application/validators";

export const makeUpdateUserPasswordValidator =
  (): UpdateUserPasswordValidatorProtocol => {
    return new UpdateUserPasswordValidator();
  };
