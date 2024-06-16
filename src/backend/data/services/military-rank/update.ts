import { UpdateProps } from "@/backend/domain/entities";
import { UpdateMilitaryRankUsecase } from "@/backend/domain/usecases";
import { MilitaryRankRepository } from "../../repositories";

export class UpdateMilitaryRankService implements UpdateMilitaryRankUsecase {
  constructor(private readonly repository: MilitaryRankRepository) {}

  public readonly update = async (props: UpdateProps): Promise<void> => {
    return await this.repository.update(props);
  };
}
