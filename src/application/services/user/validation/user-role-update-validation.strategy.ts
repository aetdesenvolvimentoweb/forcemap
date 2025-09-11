import { UserRole } from "../../../../domain/entities";
import {
  IdValidatorProtocol,
  UpdateUserRoleValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
} from "../../../protocols";
import { IUserRoleUpdateValidationStrategy } from "./validation-strategy.interface";

interface UserRoleUpdateValidationStrategyDeps {
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: UserIdRegisteredValidatorProtocol;
  updateUserRoleValidator: UpdateUserRoleValidatorProtocol;
}

export class UserRoleUpdateValidationStrategy
  implements IUserRoleUpdateValidationStrategy
{
  constructor(private readonly deps: UserRoleUpdateValidationStrategyDeps) {}

  async validate(id: string, role: UserRole): Promise<void> {
    const { idValidator, idRegisteredValidator, updateUserRoleValidator } =
      this.deps;

    idValidator.validate(id);
    await idRegisteredValidator.validate(id);
    await updateUserRoleValidator.validate(role);
  }
}
