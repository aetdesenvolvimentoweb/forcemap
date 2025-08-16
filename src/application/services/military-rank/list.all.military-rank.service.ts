import type { MilitaryRank } from "@domain/entities";
import type { MilitaryRankRepository } from "@domain/repositories";
import { ListAllMilitaryRankUseCase } from "@domain/usecases/military-ranks/list.all.military-rank.use-case";

interface ListAllMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
}

export class ListAllMilitaryRankService implements ListAllMilitaryRankUseCase {
  constructor(private readonly props: ListAllMilitaryRankServiceProps) {}

  public readonly listAll = async (): Promise<MilitaryRank[]> => {
    const { militaryRankRepository } = this.props;

    return militaryRankRepository.listAll();
  };
}
