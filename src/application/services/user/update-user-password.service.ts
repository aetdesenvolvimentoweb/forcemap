import { UpdateUserInputDTO } from "../../../domain/dtos";
import { UpdateUserPasswordUseCase } from "../../../domain/use-cases";
import { EntityNotFoundError, InvalidParamError } from "../../errors";
import { UserDomainServices } from "./user-domain-services.interface";

export class UpdateUserPasswordService implements UpdateUserPasswordUseCase {
  constructor(private readonly dependencies: UserDomainServices) {}

  public readonly updateUserPassword = async (
    id: string,
    data: UpdateUserInputDTO,
  ): Promise<void> => {
    const {
      repository,
      sessionRepository,
      passwordHasher,
      idSanitizer,
      updateUserPasswordSanitizer,
      updateUserPasswordValidator,
    } = this.dependencies;

    const sanitizedUserId = idSanitizer.sanitize(id);
    const sanitizedData = updateUserPasswordSanitizer.sanitize(data);

    await updateUserPasswordValidator.validate(sanitizedData);

    const user = await repository.findByIdWithPassword(sanitizedUserId);
    if (!user) throw new EntityNotFoundError("Usuário");

    const match = await passwordHasher.compare(
      sanitizedData.currentPassword,
      user.password,
    );
    if (!match) throw new InvalidParamError("Senha atual", "incorreta");

    const hashedPassword = await passwordHasher.hash(sanitizedData.newPassword);
    const passwordHashedData = {
      ...sanitizedData,
      newPassword: hashedPassword,
    };

    await repository.updateUserPassword(sanitizedUserId, passwordHashedData);

    // Invalida todas as sessões do usuário após alterar a senha (segurança)
    await sessionRepository.deactivateAllUserSessions(sanitizedUserId);
  };
}
