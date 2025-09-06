import {
  IdValidatorProtocol,
  UserInputDTOValidatorProtocol,
} from "../../../../application/protocols";
import { UserInputDTOValidator } from "../../../../application/validators";
import {
  MilitaryRepository,
  UserRepository,
} from "../../../../domain/repositories";

export const makeUserInputDTOValidator = (
  userRepository: UserRepository,
  idValidator: IdValidatorProtocol,
  militaryRepository: MilitaryRepository,
): UserInputDTOValidatorProtocol => {
  return new UserInputDTOValidator({
    userRepository,
    idValidator,
    militaryRepository,
  });
};
