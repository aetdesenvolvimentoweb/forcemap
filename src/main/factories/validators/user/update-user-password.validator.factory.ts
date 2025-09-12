import { UpdateUserPasswordValidatorProtocol } from "../../../../application/protocols";
import {
  UpdateUserPasswordValidator,
  UserPasswordValidator,
} from "../../../../application/validators";

export const makeUpdateUserPasswordValidator =
  (): UpdateUserPasswordValidatorProtocol => {
    const userPasswordValidator = new UserPasswordValidator();
    return new UpdateUserPasswordValidator(userPasswordValidator);
  };
