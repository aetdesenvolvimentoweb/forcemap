import { UserRole } from "../../../domain/entities";
import { UserRepository } from "../../../domain/repositories";
import { InvalidParamError } from "../../errors";
import { MilitaryDeletionPermissionValidatorProtocol } from "../../protocols";

interface MilitaryDeletionPermissionValidatorProps {
  userRepository: UserRepository;
}

export class MilitaryDeletionPermissionValidator
  implements MilitaryDeletionPermissionValidatorProtocol
{
  constructor(
    private readonly props: MilitaryDeletionPermissionValidatorProps,
  ) {}

  validate = async (
    militaryId: string,
    requestingUserRole: UserRole,
  ): Promise<void> => {
    const { userRepository } = this.props;

    const userToDelete = await userRepository.findByMilitaryId(militaryId);

    if (!userToDelete) {
      return;
    }

    if (requestingUserRole === UserRole.ADMIN) {
      return;
    }

    if (requestingUserRole === UserRole.CHEFE) {
      if (userToDelete.role === UserRole.ADMIN) {
        throw new InvalidParamError(
          "Militar",
          "chefe não pode excluir militar com função de administrador",
        );
      }
      return;
    }

    throw new InvalidParamError(
      "Militar",
      "usuário não tem permissão para excluir militares",
    );
  };
}
