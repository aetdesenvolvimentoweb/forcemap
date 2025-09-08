import { MilitaryInUseValidatorProtocol } from "../../../../application/protocols";
import { MilitaryInUseValidator } from "../../../../application/validators";
import { UserRepository } from "../../../../domain/repositories";

export const makeMilitaryInUseValidator = (
  userRepository: UserRepository,
): MilitaryInUseValidatorProtocol => {
  return new MilitaryInUseValidator({
    userRepository,
  });
};
