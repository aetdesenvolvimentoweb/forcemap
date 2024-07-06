import { DeleteMilitaryUsecase } from "@/backend/domain/usecases";
import { MilitaryRepository } from "../../repositories";
import { MilitaryValidator } from "../../validators";

export type Dependencies = {
  repository: MilitaryRepository;
  validator: MilitaryValidator;
};

export class DeleteMilitaryService implements DeleteMilitaryUsecase {
  private readonly repository: MilitaryRepository;
  private readonly validator: MilitaryValidator;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
    this.validator = dependencies.validator;
  }

  public readonly delete = async (id: string): Promise<void> => {
    await this.validator.validateId(id);

    await this.repository.delete(id);
  };
}
