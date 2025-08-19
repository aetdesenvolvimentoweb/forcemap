import type {
  MilitaryRankInputDTOSanitizerProtocol,
  MilitaryRankValidatorProtocol,
} from "@application/protocols";

import type { MilitaryRankInputDTO } from "@domain/dtos";
import type { MilitaryRankRepository } from "@domain/repositories";
import type { CreateMilitaryRankUseCase } from "@domain/usecases";

interface CreateMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: MilitaryRankInputDTOSanitizerProtocol;
  validator: MilitaryRankValidatorProtocol;
}

export class CreateMilitaryRankService implements CreateMilitaryRankUseCase {
  constructor(private readonly props: CreateMilitaryRankServiceProps) {}

  public readonly create = async (
    data: MilitaryRankInputDTO,
  ): Promise<void> => {
    const { militaryRankRepository, sanitizer, validator } = this.props;

    const sanitizedData = sanitizer.sanitize(data);
    await validator.validate(sanitizedData);
    await militaryRankRepository.create(sanitizedData);
  };
}
