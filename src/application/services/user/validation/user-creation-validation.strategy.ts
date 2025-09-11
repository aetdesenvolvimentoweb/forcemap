import { UserInputDTO } from "../../../../domain/dtos";
import { UserRole } from "../../../../domain/entities";
import { UserInputDTOValidatorProtocol } from "../../../protocols";
import { IUserCreationValidationStrategy } from "./validation-strategy.interface";

interface UserCreationValidationStrategyDeps {
  userInputDTOValidator: UserInputDTOValidatorProtocol;
}

export class UserCreationValidationStrategy
  implements IUserCreationValidationStrategy
{
  constructor(private readonly deps: UserCreationValidationStrategyDeps) {}

  async validate(
    data: UserInputDTO,
    requestingUserRole?: UserRole,
  ): Promise<void> {
    await this.deps.userInputDTOValidator.validate(data, requestingUserRole);
  }
}
