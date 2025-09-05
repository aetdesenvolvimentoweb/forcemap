import {
  UserAuthenticatedDTO,
  UserCredentialsInputDTO,
} from "../../../domain/dtos";
import {
  AuthenticateUserUseCase,
  FindByMilitaryIdWithPasswordUserUseCase,
  FindByRgMilitaryUseCase,
} from "../../../domain/use-cases";
import { NotAuthorizedError } from "../../errors";
import {
  PasswordHasherProtocol,
  UserCredentialsInputDTOSanitizerProtocol,
  UserCredentialsInputDTOValidatorProtocol,
} from "../../protocols";

interface AuthenticateUserServiceProps {
  findMilitaryByRg: FindByRgMilitaryUseCase;
  findUserByMilitaryIdWithPassword: FindByMilitaryIdWithPasswordUserUseCase;
  sanitizer: UserCredentialsInputDTOSanitizerProtocol;
  validator: UserCredentialsInputDTOValidatorProtocol;
  passwordHasher: PasswordHasherProtocol;
}

export class AuthenticateUserService implements AuthenticateUserUseCase {
  private readonly props: AuthenticateUserServiceProps;

  constructor(props: AuthenticateUserServiceProps) {
    this.props = props;
  }

  public readonly authenticate = async (
    credentials: UserCredentialsInputDTO,
  ): Promise<UserAuthenticatedDTO | null> => {
    const {
      findMilitaryByRg,
      findUserByMilitaryIdWithPassword,
      sanitizer,
      validator,
      passwordHasher,
    } = this.props;

    // Sanitize and validate input
    const sanitizedCredentials = sanitizer.sanitize(credentials);
    validator.validate(sanitizedCredentials);

    // Find military by RG
    const military = await findMilitaryByRg.findByRg(sanitizedCredentials.rg);
    if (!military) {
      throw new NotAuthorizedError();
    }

    // Find user by military ID with password
    const user =
      await findUserByMilitaryIdWithPassword.findByMilitaryIdWithPassword(
        military.id,
      );
    if (!user) {
      throw new NotAuthorizedError();
    }

    // Verify password
    const isPasswordValid = await passwordHasher.compare(
      sanitizedCredentials.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new NotAuthorizedError();
    }

    // Return authenticated user data
    return {
      id: user.id,
      role: user.role,
      military: military.militaryRank?.abbreviation + " " + military.name,
    };
  };
}
