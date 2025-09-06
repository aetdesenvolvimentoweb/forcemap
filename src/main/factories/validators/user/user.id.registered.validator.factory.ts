import { UserIdRegisteredValidatorProtocol } from "../../../../application/protocols";
import { UserIdRegisteredValidator } from "../../../../application/validators";
import { UserRepository } from "../../../../domain/repositories";

export const makeUserIdRegisteredValidator = (
  userRepository: UserRepository,
): UserIdRegisteredValidatorProtocol => {
  return new UserIdRegisteredValidator({
    userRepository,
  });
};
