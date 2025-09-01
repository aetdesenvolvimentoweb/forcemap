import { MilitaryRankRepository } from "../../../domain/repositories";
import { EntityNotFoundError } from "../../errors";
import { MilitaryRankIdRegisteredValidatorProtocol } from "../../protocols";

interface MilitaryRankIdRegisteredValidatorProps {
  militaryRankRepository: MilitaryRankRepository;
}

export class MilitaryRankIdRegisteredValidator
  implements MilitaryRankIdRegisteredValidatorProtocol
{
  constructor(private readonly props: MilitaryRankIdRegisteredValidatorProps) {}

  validate = async (id: string): Promise<void> => {
    const { militaryRankRepository } = this.props;
    const militaryRank = await militaryRankRepository.findById(id);

    if (!militaryRank) {
      throw new EntityNotFoundError("Posto/Graduação");
    }
  };
}
