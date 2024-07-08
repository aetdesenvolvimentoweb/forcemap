import { MilitaryPublic } from "@/backend/domain/entities";
import { GetAllMilitaryUsecase } from "@/backend/domain/usecases";
import { MilitaryRepository } from "../../repositories";

export class GetAllMilitaryService implements GetAllMilitaryUsecase {
  constructor(private readonly repository: MilitaryRepository) {}

  public readonly getAll = async (): Promise<MilitaryPublic[]> => {
    return await this.repository.getAll();
  };
}
