import { CreateMilitaryRankDTO } from "@domain/dtos";
import { MilitaryRankRepository } from "@domain/repositories";
import { CreateMilitaryRankUseCase } from "@domain/usecases";

interface CreateMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
}

export class CreateMilitaryRankService implements CreateMilitaryRankUseCase {
  constructor(private readonly props: CreateMilitaryRankServiceProps) {}

  public readonly create = async (
    data: CreateMilitaryRankDTO,
  ): Promise<void> => {
    await this.props.militaryRankRepository.create(data);
  };
}
