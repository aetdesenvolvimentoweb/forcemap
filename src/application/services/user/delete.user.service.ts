import { UserRepository } from "../../../domain/repositories";
import { DeleteUserUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
} from "../../protocols";
import { BaseDeleteService, BaseDeleteServiceDeps } from "../common";

interface DeleteUserServiceProps {
  userRepository: UserRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: UserIdRegisteredValidatorProtocol;
}

export class DeleteUserService
  extends BaseDeleteService
  implements DeleteUserUseCase
{
  constructor(props: DeleteUserServiceProps) {
    const baseServiceDeps: BaseDeleteServiceDeps = {
      repository: props.userRepository,
      idSanitizer: props.sanitizer,
      idValidator: props.idValidator,
      idRegisteredValidator: props.idRegisteredValidator,
    };
    super(baseServiceDeps);
  }
}
