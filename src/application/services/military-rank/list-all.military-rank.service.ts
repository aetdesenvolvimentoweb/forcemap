import { MilitaryRank } from "../../../domain/entities";
import { MilitaryRankRepository } from "../../../domain/repositories";
import { ListAllMilitaryRankUseCase } from "../../../domain/use-cases";

interface ListAllMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
}

export class ListAllMilitaryRankService implements ListAllMilitaryRankUseCase {
  private readonly props: ListAllMilitaryRankServiceProps;

  constructor(props: ListAllMilitaryRankServiceProps) {
    this.props = props;
  }

  public readonly listAll = async (): Promise<MilitaryRank[]> => {
    const { militaryRankRepository } = this.props;
    return await militaryRankRepository.listAll();
  };
}
