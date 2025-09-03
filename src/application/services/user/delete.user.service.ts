import { UserRepository } from "../../../domain/repositories";
import { DeleteUserUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
} from "../../protocols";

interface DeleteUserServiceProps {
  userRepository: UserRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: UserIdRegisteredValidatorProtocol;
}

export class DeleteUserService implements DeleteUserUseCase {
  private readonly props: DeleteUserServiceProps;

  constructor(props: DeleteUserServiceProps) {
    this.props = props;
  }

  public readonly delete = async (id: string): Promise<void> => {
    const { userRepository, sanitizer, idValidator, idRegisteredValidator } =
      this.props;

    const sanitizedId = sanitizer.sanitize(id);
    idValidator.validate(sanitizedId);
    await idRegisteredValidator.validate(sanitizedId);
    await userRepository.delete(sanitizedId);
  };
}
