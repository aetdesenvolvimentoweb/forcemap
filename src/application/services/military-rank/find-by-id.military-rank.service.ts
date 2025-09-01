import { MilitaryRank } from "../../../domain/entities";
import { MilitaryRankRepository } from "../../../domain/repositories";
import { FindByIdMilitaryRankUseCase } from "../../../domain/use-cases";
import { IdSanitizerProtocol, IdValidatorProtocol } from "../../protocols";

interface FindByIdMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: IdSanitizerProtocol;
  validator: IdValidatorProtocol;
}

export class FindByIdMilitaryRankService
  implements FindByIdMilitaryRankUseCase
{
  private readonly props: FindByIdMilitaryRankServiceProps;

  constructor(props: FindByIdMilitaryRankServiceProps) {
    this.props = props;
  }

  public readonly findById = async (
    id: string,
  ): Promise<MilitaryRank | null> => {
    const { militaryRankRepository, sanitizer, validator } = this.props;

    const sanitizedId = sanitizer.sanitize(id);
    await validator.validate(sanitizedId);
    const militaryRank = await militaryRankRepository.findById(sanitizedId);
    return militaryRank;
  };
}
