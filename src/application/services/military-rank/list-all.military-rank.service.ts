import { MilitaryRank } from "../../../domain/entities";
import { MilitaryRankRepository } from "../../../domain/repositories";
import { ListAllMilitaryRankUseCase } from "../../../domain/use-cases";
import { BaseListAllService, BaseListAllServiceDeps } from "../common";

interface ListAllMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
}

export class ListAllMilitaryRankService
  extends BaseListAllService<MilitaryRank>
  implements ListAllMilitaryRankUseCase
{
  constructor(props: ListAllMilitaryRankServiceProps) {
    const baseServiceDeps: BaseListAllServiceDeps<MilitaryRank> = {
      repository: props.militaryRankRepository,
    };
    super(baseServiceDeps);
  }
}
