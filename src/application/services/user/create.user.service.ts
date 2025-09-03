import { UserInputDTO } from "../../../domain/dtos";
import { UserRepository } from "../../../domain/repositories";
import { CreateUserUseCase } from "../../../domain/use-cases";
import {
  PasswordHasherProtocol,
  UserInputDTOSanitizerProtocol,
  UserInputDTOValidatorProtocol,
} from "../../protocols";

interface CreateUserServiceProps {
  userRepository: UserRepository;
  sanitizer: UserInputDTOSanitizerProtocol;
  validator: UserInputDTOValidatorProtocol;
  passwordHasher: PasswordHasherProtocol;
}

export class CreateUserService implements CreateUserUseCase {
  private readonly props: CreateUserServiceProps;

  constructor(props: CreateUserServiceProps) {
    this.props = props;
  }

  public readonly create = async (data: UserInputDTO): Promise<void> => {
    const { userRepository, sanitizer, validator, passwordHasher } = this.props;

    const sanitizedData = sanitizer.sanitize(data);
    await validator.validate(sanitizedData);

    // Hash the password before storing
    const hashedPassword = await passwordHasher.hash(sanitizedData.password);
    const userDataWithHashedPassword = {
      ...sanitizedData,
      password: hashedPassword,
    };

    await userRepository.create(userDataWithHashedPassword);
  };
}
