import { UserOutputDTO } from "../../../domain/dtos";
import { UserRepository } from "../../../domain/repositories";
import { FindByIdUserUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
} from "../../protocols";
import { BaseFindByIdService, BaseFindByIdServiceDeps } from "../common";

interface FindByIdUserServiceProps {
  userRepository: UserRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: UserIdRegisteredValidatorProtocol;
}

export class FindByIdUserService
  extends BaseFindByIdService<UserOutputDTO>
  implements FindByIdUserUseCase
{
  constructor(props: FindByIdUserServiceProps) {
    const baseServiceDeps: BaseFindByIdServiceDeps<UserOutputDTO> = {
      repository: props.userRepository,
      idSanitizer: props.sanitizer,
      idValidator: props.idValidator,
      idRegisteredValidator: props.idRegisteredValidator,
    };
    super(baseServiceDeps);
  }
}
