import { UserInputDTO } from "../../../domain/dtos";
import { UserRepository } from "../../../domain/repositories";
import { CreateUserUseCase } from "../../../domain/use-cases";
import {
  UserInputDTOSanitizerProtocol,
  UserInputDTOValidatorProtocol,
} from "../../protocols";

interface CreateUserServiceProps {
  userRepository: UserRepository;
  sanitizer: UserInputDTOSanitizerProtocol;
  validator: UserInputDTOValidatorProtocol;
}

export class CreateUserService implements CreateUserUseCase {
  private readonly props: CreateUserServiceProps;

  constructor(props: CreateUserServiceProps) {
    this.props = props;
  }

  public readonly create = async (data: UserInputDTO): Promise<void> => {
    const { userRepository, sanitizer, validator } = this.props;

    const sanitizedData = sanitizer.sanitize(data);
    await validator.validate(sanitizedData);
    await userRepository.create(sanitizedData);
  };
}
