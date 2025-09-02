import { MilitaryRankRepository } from "../../../domain/repositories";
import { DeleteMilitaryRankUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  MilitaryRankIdRegisteredValidatorProtocol,
  MilitaryRankInUseValidatorProtocol,
} from "../../protocols";

interface DeleteMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: MilitaryRankIdRegisteredValidatorProtocol;
  inUseValidator: MilitaryRankInUseValidatorProtocol;
}

export class DeleteMilitaryRankService implements DeleteMilitaryRankUseCase {
  private readonly props: DeleteMilitaryRankServiceProps;

  constructor(props: DeleteMilitaryRankServiceProps) {
    this.props = props;
  }

  public readonly delete = async (id: string): Promise<void> => {
    const {
      militaryRankRepository,
      sanitizer,
      idValidator,
      idRegisteredValidator,
      inUseValidator,
    } = this.props;

    const sanitizedId = sanitizer.sanitize(id);
    idValidator.validate(sanitizedId);
    await idRegisteredValidator.validate(sanitizedId);
    await inUseValidator.validate(sanitizedId);
    await militaryRankRepository.delete(sanitizedId);
  };
}
