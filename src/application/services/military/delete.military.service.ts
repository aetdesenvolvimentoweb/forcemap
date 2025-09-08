import { MilitaryRepository } from "../../../domain/repositories";
import { DeleteMilitaryUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
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
}

export class DeleteMilitaryService
  extends BaseDeleteService
  implements DeleteMilitaryUseCase
{
  private readonly inUseValidator: MilitaryInUseValidatorProtocol;

  constructor(props: DeleteMilitaryServiceProps) {
    const baseServiceDeps: BaseDeleteServiceDeps = {
      repository: props.militaryRepository,
      idSanitizer: props.sanitizer,
      idValidator: props.idValidator,
      idRegisteredValidator: props.idRegisteredValidator,
    };
    super(baseServiceDeps);
    this.inUseValidator = props.inUseValidator;
  }

  protected async performAdditionalValidations(id: string): Promise<void> {
    await this.inUseValidator.validate(id);
  }
}
