import { MilitaryRank } from "../../../domain/entities";
import { MilitaryRankRepository } from "../../../domain/repositories";
import { ListByIdMilitaryRankUseCase } from "../../../domain/use-cases";
import { IdSanitizerProtocol, IdValidatorProtocol } from "../../protocols";

interface ListByIdMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: IdSanitizerProtocol;
  validator: IdValidatorProtocol;
}

export class ListByIdMilitaryRankService
  implements ListByIdMilitaryRankUseCase
{
  private readonly props: ListByIdMilitaryRankServiceProps;

  constructor(props: ListByIdMilitaryRankServiceProps) {
    this.props = props;
  }

  public readonly listById = async (
    id: string,
  ): Promise<MilitaryRank | null> => {
    const { militaryRankRepository, sanitizer, validator } = this.props;

    const sanitizedId = sanitizer.sanitize(id);
    await validator.validate(sanitizedId);
    const militaryRank = await militaryRankRepository.listById(sanitizedId);
    return militaryRank;
  };
}
