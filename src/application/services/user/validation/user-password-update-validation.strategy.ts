import { UpdateUserInputDTO } from "../../../../domain/dtos";
import {
  IdValidatorProtocol,
  UpdateUserPasswordValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
} from "../../../protocols";
import { IUserPasswordUpdateValidationStrategy } from "./validation-strategy.interface";

interface UserPasswordUpdateValidationStrategyDeps {
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: UserIdRegisteredValidatorProtocol;
  updateUserPasswordValidator: UpdateUserPasswordValidatorProtocol;
}

export class UserPasswordUpdateValidationStrategy
  implements IUserPasswordUpdateValidationStrategy
{
  constructor(
    private readonly deps: UserPasswordUpdateValidationStrategyDeps,
  ) {}

  async validate(id: string, data: UpdateUserInputDTO): Promise<void> {
    const { idValidator, idRegisteredValidator, updateUserPasswordValidator } =
      this.deps;

    idValidator.validate(id);
    await idRegisteredValidator.validate(id);
    await updateUserPasswordValidator.validate(data);
  }
}
