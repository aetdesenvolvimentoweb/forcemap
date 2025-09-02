import { MilitaryOutputDTO } from "../../../domain/dtos";
import { MilitaryRepository } from "../../../domain/repositories";
import { ListAllMilitaryUseCase } from "../../../domain/use-cases";

interface ListAllMilitaryServiceProps {
  militaryRepository: MilitaryRepository;
}

export class ListAllMilitaryService implements ListAllMilitaryUseCase {
  private readonly props: ListAllMilitaryServiceProps;

  constructor(props: ListAllMilitaryServiceProps) {
    this.props = props;
  }

  public readonly listAll = async (): Promise<MilitaryOutputDTO[]> => {
    const { militaryRepository } = this.props;
    return await militaryRepository.listAll();
  };
}
