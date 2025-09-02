import { MilitaryRepository } from "../../../domain/repositories";
import { DeleteMilitaryUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  MilitaryIdRegisteredValidatorProtocol,
} from "../../protocols";

interface DeleteMilitaryServiceProps {
  militaryRepository: MilitaryRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: MilitaryIdRegisteredValidatorProtocol;
}

export class DeleteMilitaryService implements DeleteMilitaryUseCase {
  private readonly props: DeleteMilitaryServiceProps;

  constructor(props: DeleteMilitaryServiceProps) {
    this.props = props;
  }

  public readonly delete = async (id: string): Promise<void> => {
    const {
      militaryRepository,
      sanitizer,
      idValidator,
      idRegisteredValidator,
    } = this.props;

    const sanitizedId = sanitizer.sanitize(id);
    idValidator.validate(sanitizedId);
    idRegisteredValidator.validate(sanitizedId);
    await militaryRepository.delete(sanitizedId);
  };
}
