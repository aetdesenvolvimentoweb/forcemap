import type { CreateMilitaryRankSanitizerProtocol } from "@application/protocols";
import type { CreateMilitaryRankDTO } from "@domain/dtos";
import type { MilitaryRankRepository } from "@domain/repositories";
import type { CreateMilitaryRankUseCase } from "@domain/usecases";

interface CreateMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: CreateMilitaryRankSanitizerProtocol;
}

export class CreateMilitaryRankService implements CreateMilitaryRankUseCase {
  constructor(private readonly props: CreateMilitaryRankServiceProps) {}

  public readonly create = async (
    data: CreateMilitaryRankDTO,
  ): Promise<void> => {
    const { militaryRankRepository, sanitizer } = this.props;

    const sanitizedData = sanitizer.sanitize(data);
    await militaryRankRepository.create(sanitizedData);
  };
}
