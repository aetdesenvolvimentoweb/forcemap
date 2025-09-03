import {
  SessionRepository,
  UserRepository,
} from "../../../domain/repositories";
import { AuthLogoutUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
} from "../../protocols";

interface LogoutAuthServiceProps {
  sessionRepository: SessionRepository;
  userRepository: UserRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  userIdValidator: UserIdRegisteredValidatorProtocol;
}

export class LogoutAuthService implements AuthLogoutUseCase {
  private readonly props: LogoutAuthServiceProps;

  constructor(props: LogoutAuthServiceProps) {
    this.props = props;
  }

  public readonly logout = async (userId: string): Promise<void> => {
    const { sessionRepository, sanitizer, idValidator, userIdValidator } =
      this.props;

    // Sanitize and validate user ID
    const sanitizedUserId = sanitizer.sanitize(userId);
    idValidator.validate(sanitizedUserId);
    await userIdValidator.validate(sanitizedUserId);

    // Delete all sessions for this user
    await sessionRepository.deleteByUserId(sanitizedUserId);
  };
}
