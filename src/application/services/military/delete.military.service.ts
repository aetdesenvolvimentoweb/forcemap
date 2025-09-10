import { UserRole } from "../../../domain/entities";
import { MilitaryRepository } from "../../../domain/repositories";
import { DeleteMilitaryUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  MilitaryDeletionPermissionValidatorProtocol,
  MilitaryIdRegisteredValidatorProtocol,
  MilitaryInUseValidatorProtocol,
} from "../../protocols";
import { BaseDeleteService, BaseDeleteServiceDeps } from "../common";

interface DeleteMilitaryServiceProps {
  militaryRepository: MilitaryRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: MilitaryIdRegisteredValidatorProtocol;
  inUseValidator: MilitaryInUseValidatorProtocol;
  deletionPermissionValidator: MilitaryDeletionPermissionValidatorProtocol;
}

export class DeleteMilitaryService
  extends BaseDeleteService
  implements DeleteMilitaryUseCase
{
  private readonly inUseValidator: MilitaryInUseValidatorProtocol;
  private readonly deletionPermissionValidator: MilitaryDeletionPermissionValidatorProtocol;

  constructor(props: DeleteMilitaryServiceProps) {
    const baseServiceDeps: BaseDeleteServiceDeps = {
      repository: props.militaryRepository,
      idSanitizer: props.sanitizer,
      idValidator: props.idValidator,
      idRegisteredValidator: props.idRegisteredValidator,
    };
    super(baseServiceDeps);
    this.inUseValidator = props.inUseValidator;
    this.deletionPermissionValidator = props.deletionPermissionValidator;
  }

  public readonly delete = async (
    id: string,
    requestingUserRole?: UserRole,
  ): Promise<void> => {
    const sanitizedId = this.idSanitizer.sanitize(id);
    this.idValidator.validate(sanitizedId);
    await this.idRegisteredValidator.validate(sanitizedId);

    if (requestingUserRole) {
      await this.deletionPermissionValidator.validate(
        sanitizedId,
        requestingUserRole,
      );
    }

    await this.performAdditionalValidations(sanitizedId);
    await this.repository.delete(sanitizedId);
  };

  protected async performAdditionalValidations(id: string): Promise<void> {
    await this.inUseValidator.validate(id);
  }
}
