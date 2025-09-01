import { MilitaryRank } from "../../../domain/entities";
import { MilitaryRankRepository } from "../../../domain/repositories";
import { FindByIdMilitaryRankUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  MilitaryRankIdRegisteredValidatorProtocol,
} from "../../protocols";

interface FindByIdMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: MilitaryRankIdRegisteredValidatorProtocol;
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
    const {
      militaryRankRepository,
      sanitizer,
      idValidator,
      idRegisteredValidator,
    } = this.props;

    const sanitizedId = sanitizer.sanitize(id);
    idValidator.validate(sanitizedId);
    idRegisteredValidator.validate(sanitizedId);
    const militaryRank = await militaryRankRepository.findById(sanitizedId);
    return militaryRank;
  };
}
