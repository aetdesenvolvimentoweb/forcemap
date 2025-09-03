import { UserInputDTO } from "../../../domain/dtos";
import { UserRepository } from "../../../domain/repositories";
import { UpdateUserUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
  UserInputDTOSanitizerProtocol,
  UserInputDTOValidatorProtocol,
} from "../../protocols";

interface UpdateUserServiceProps {
  userRepository: UserRepository;
  idSanitizer: IdSanitizerProtocol;
  dataSanitizer: UserInputDTOSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: UserIdRegisteredValidatorProtocol;
  dataValidator: UserInputDTOValidatorProtocol;
}

export class UpdateUserService implements UpdateUserUseCase {
  private readonly props: UpdateUserServiceProps;

  constructor(props: UpdateUserServiceProps) {
    this.props = props;
  }

  public readonly update = async (
    id: string,
    data: UserInputDTO,
  ): Promise<void> => {
    const {
      userRepository,
      idSanitizer,
      dataSanitizer,
      idValidator,
      idRegisteredValidator,
      dataValidator,
    } = this.props;

    const sanitizedId = idSanitizer.sanitize(id);
    idValidator.validate(sanitizedId);
    await idRegisteredValidator.validate(sanitizedId);
    const sanitizedData = dataSanitizer.sanitize(data);
    await dataValidator.validate(sanitizedData, sanitizedId);
    await userRepository.update(sanitizedId, sanitizedData);
  };
}
