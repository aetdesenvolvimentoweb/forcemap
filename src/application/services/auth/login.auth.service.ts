import { LoginInputDTO, UserLoggedDTO } from "../../../domain/dtos";
import {
  MilitaryRepository,
  UserRepository,
} from "../../../domain/repositories";
import { AuthLoginUseCase } from "../../../domain/use-cases";
import { NotAuthorizedError } from "../../errors";
import {
  LoginInputDTOSanitizerProtocol,
  LoginInputDTOValidatorProtocol,
  PasswordHasherProtocol,
} from "../../protocols";

interface LoginAuthServiceProps {
  militaryRepository: MilitaryRepository;
  userRepository: UserRepository;
  sanitizer: LoginInputDTOSanitizerProtocol;
  validator: LoginInputDTOValidatorProtocol;
  passwordHasher: PasswordHasherProtocol;
}

export class LoginAuthService implements AuthLoginUseCase {
  private readonly props: LoginAuthServiceProps;

  constructor(props: LoginAuthServiceProps) {
    this.props = props;
  }

  public readonly login = async (
    data: LoginInputDTO,
  ): Promise<UserLoggedDTO> => {
    const {
      militaryRepository,
      userRepository,
      sanitizer,
      validator,
      passwordHasher,
    } = this.props;

    // Sanitize and validate input
    const sanitizedData = sanitizer.sanitize(data);
    validator.validate(sanitizedData);

    // Find military by RG
    const military = await militaryRepository.findByRg(sanitizedData.rg);
    if (!military) {
      throw new NotAuthorizedError();
    }

    // Find user by military ID with password
    const user = await userRepository.findByMilitaryIdWithPassword(military.id);
    if (!user) {
      throw new NotAuthorizedError();
    }

    // Verify password
    const isPasswordValid = await passwordHasher.compare(
      sanitizedData.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new NotAuthorizedError();
    }

    // Return user data without sensitive information
    return {
      id: user.id,
      role: user.role,
      military: military.militaryRank.abbreviation + " " + military.name,
    };
  };
}
