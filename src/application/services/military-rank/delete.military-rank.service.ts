import { MilitaryRankRepository } from "../../../domain/repositories";
import { DeleteMilitaryRankUseCase } from "../../../domain/use-cases";
import { IdSanitizerProtocol, IdValidatorProtocol } from "../../protocols";

interface DeleteMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: IdSanitizerProtocol;
  validator: IdValidatorProtocol;
}

export class DeleteMilitaryRankService implements DeleteMilitaryRankUseCase {
  private readonly props: DeleteMilitaryRankServiceProps;

  constructor(props: DeleteMilitaryRankServiceProps) {
    this.props = props;
  }

  public readonly delete = async (id: string): Promise<void> => {
    const { militaryRankRepository, sanitizer, validator } = this.props;

    const sanitizedId = sanitizer.sanitize(id);
    validator.validate(sanitizedId);
    await militaryRankRepository.delete(sanitizedId);
  };
}
