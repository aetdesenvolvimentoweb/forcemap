import { MilitaryRankRepository } from "../../../domain/repositories";
import { DeleteMilitaryRankUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  MilitaryRankIdRegisteredValidatorProtocol,
  MilitaryRankInUseValidatorProtocol,
} from "../../protocols";
import { BaseDeleteService, BaseDeleteServiceDeps } from "../common";

interface DeleteMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: MilitaryRankIdRegisteredValidatorProtocol;
  inUseValidator: MilitaryRankInUseValidatorProtocol;
}

export class DeleteMilitaryRankService
  extends BaseDeleteService
  implements DeleteMilitaryRankUseCase
{
  private readonly inUseValidator: MilitaryRankInUseValidatorProtocol;

  constructor(props: DeleteMilitaryRankServiceProps) {
    const baseServiceDeps: BaseDeleteServiceDeps = {
      repository: props.militaryRankRepository,
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
