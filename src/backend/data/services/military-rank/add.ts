import { MilitaryRankProps } from "@/backend/domain/entities";
import { AddMilitaryRankUsecase } from "@/backend/domain/usecases";
import { MilitaryRankRepository } from "../../repositories";
import { MilitaryRankValidator } from "../../validators";

export class AddMilitaryRankService implements AddMilitaryRankUsecase {
  private readonly repository: MilitaryRankRepository;
  private readonly validator: MilitaryRankValidator;

  constructor({
    repository,
    validator,
  }: {
    repository: MilitaryRankRepository;
    validator: MilitaryRankValidator;
  }) {
    this.repository = repository;
    this.validator = validator;
  }

  public readonly add = async (props: MilitaryRankProps): Promise<void> => {
    await this.validator.validateAddProps(props);
    await this.repository.add(props);
  };
}
