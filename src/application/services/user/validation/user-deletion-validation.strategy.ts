import {
  IdValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
} from "../../../protocols";
import { IUserDeletionValidationStrategy } from "./validation-strategy.interface";

interface UserDeletionValidationStrategyDeps {
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: UserIdRegisteredValidatorProtocol;
}

export class UserDeletionValidationStrategy
  implements IUserDeletionValidationStrategy
{
  constructor(private readonly deps: UserDeletionValidationStrategyDeps) {}

  async validate(id: string): Promise<void> {
    const { idValidator, idRegisteredValidator } = this.deps;

    idValidator.validate(id);
    await idRegisteredValidator.validate(id);
  }
}
