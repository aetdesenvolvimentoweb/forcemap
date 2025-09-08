import { MilitaryRepository } from "../../../domain/repositories";
import { ResourceInUseError } from "../../errors";
import { MilitaryRankInUseValidatorProtocol } from "../../protocols";

interface MilitaryRankInUseValidatorProps {
  militaryRepository: MilitaryRepository;
}

export class MilitaryRankInUseValidator
  implements MilitaryRankInUseValidatorProtocol
{
  constructor(private readonly props: MilitaryRankInUseValidatorProps) {}

  validate = async (militaryRankId: string): Promise<void> => {
    const { militaryRepository } = this.props;

    const allMilitary = await militaryRepository.listAll();
    const isInUse = allMilitary.some(
      (military) => military.militaryRank.id === militaryRankId,
    );

    if (isInUse) {
      throw new ResourceInUseError("Posto/Graduação", "militares");
    }
  };
}
