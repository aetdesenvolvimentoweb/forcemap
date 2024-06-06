import { MilitaryRankProps } from "@/backend/domain/entities";
import { AddMilitaryRankUsecase } from "@/backend/domain/usecases";
import { MilitaryRankRepository } from "../../repositories";

export class AddMilitaryRankService implements AddMilitaryRankUsecase {
  constructor(private readonly repository: MilitaryRankRepository) {}

  public readonly add = async (props: MilitaryRankProps): Promise<void> => {
    await this.repository.add(props);
  };
}
