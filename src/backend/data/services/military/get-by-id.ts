import { MilitaryPublic } from "@/backend/domain/entities";
import { GetMilitaryByIdUsecase } from "@/backend/domain/usecases";
import { MilitaryRepository } from "../../repositories";
import { MilitaryValidator } from "../../validators";

type Dependencies = {
  repository: MilitaryRepository;
  validator: MilitaryValidator;
};

export class GetMilitaryByIdService implements GetMilitaryByIdUsecase {
  private readonly repository: MilitaryRepository;
  private readonly validator: MilitaryValidator;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
    this.validator = dependencies.validator;
  }

  public readonly getById = async (
    id: string
  ): Promise<MilitaryPublic | null> => {
    await this.validator.validateId(id);

    return await this.repository.getById(id);
  };
}
