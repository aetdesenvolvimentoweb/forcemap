import { UserOutputDTO } from "../../../domain/dtos";
import { UserRepository } from "../../../domain/repositories";
import { FindByIdUserUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
} from "../../protocols";

interface FindByIdUserServiceProps {
  userRepository: UserRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: UserIdRegisteredValidatorProtocol;
}

export class FindByIdUserService implements FindByIdUserUseCase {
  private readonly props: FindByIdUserServiceProps;

  constructor(props: FindByIdUserServiceProps) {
    this.props = props;
  }

  public readonly findById = async (
    id: string,
  ): Promise<UserOutputDTO | null> => {
    const { userRepository, sanitizer, idValidator, idRegisteredValidator } =
      this.props;

    const sanitizedId = sanitizer.sanitize(id);
    idValidator.validate(sanitizedId);
    await idRegisteredValidator.validate(sanitizedId);
    const user = await userRepository.findById(sanitizedId);
    return user;
  };
}
