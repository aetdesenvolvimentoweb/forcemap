import { UpdateUserInputDTO } from "../../../domain/dtos";
import { UserRepository } from "../../../domain/repositories";
import { UpdateUserPasswordUseCase } from "../../../domain/use-cases";
import { EntityNotFoundError, InvalidParamError } from "../../errors";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  PasswordHasherProtocol,
  UpdateUserPasswordSanitizerProtocol,
  UpdateUserPasswordValidatorProtocol,
  UserIdRegisteredValidatorProtocol,
} from "../../protocols";

interface UpdateUserPasswordServiceProps {
  userRepository: UserRepository;
  idSanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: UserIdRegisteredValidatorProtocol;
  updateUserPasswordSanitizer: UpdateUserPasswordSanitizerProtocol;
  updateUserPasswordValidator: UpdateUserPasswordValidatorProtocol;
  passwordHasher: PasswordHasherProtocol;
}

export class UpdateUserPasswordService implements UpdateUserPasswordUseCase {
  private readonly props: UpdateUserPasswordServiceProps;

  constructor(props: UpdateUserPasswordServiceProps) {
    this.props = props;
  }

  public readonly updateUserPassword = async (
    id: string,
    data: UpdateUserInputDTO,
  ): Promise<void> => {
    const {
      userRepository,
      idSanitizer,
      idValidator,
      idRegisteredValidator,
      updateUserPasswordSanitizer,
      updateUserPasswordValidator,
      passwordHasher,
    } = this.props;

    const sanitizedUserId = idSanitizer.sanitize(id);
    idValidator.validate(sanitizedUserId);
    await idRegisteredValidator.validate(sanitizedUserId);

    const sanitizedData = updateUserPasswordSanitizer.sanitize(data);
    await updateUserPasswordValidator.validate(sanitizedData);

    const user =
      await userRepository.findByMilitaryIdWithPassword(sanitizedUserId);
    if (!user) throw new EntityNotFoundError("Usuário");

    const match = await passwordHasher.compare(
      sanitizedData.currentPassword,
      user.password,
    );
    if (!match) throw new InvalidParamError("Senha atual", "incorreta");

    await userRepository.updateUserPassword(sanitizedUserId, sanitizedData);
  };
}
