import { MilitaryRankRepository } from "../../../domain/repositories";
import { DeleteMilitaryRankUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  MilitaryRankIdRegisteredValidatorProtocol,
} from "../../protocols";

interface DeleteMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: MilitaryRankIdRegisteredValidatorProtocol;
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
    } = this.props;

    const sanitizedId = sanitizer.sanitize(id);
    idValidator.validate(sanitizedId);
    idRegisteredValidator.validate(sanitizedId);
    await militaryRankRepository.delete(sanitizedId);
  };
}
