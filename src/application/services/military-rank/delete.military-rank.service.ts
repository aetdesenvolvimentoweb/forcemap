import { EntityNotFoundError } from "@application/errors";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
} from "@application/protocols";

import type { MilitaryRankRepository } from "@domain/repositories";
import { DeleteMilitaryRankUseCase } from "@domain/usecases";

interface DeleteMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: IdSanitizerProtocol;
  validator: IdValidatorProtocol;
}

export class DeleteMilitaryRankService implements DeleteMilitaryRankUseCase {
  constructor(private readonly props: DeleteMilitaryRankServiceProps) {}

  public readonly delete = async (id: string): Promise<void> => {
    const { militaryRankRepository, sanitizer, validator } = this.props;

    const sanitizedId = sanitizer.sanitize(id);
    await validator.validate(sanitizedId);
    const militaryRank = await militaryRankRepository.listById(sanitizedId);

    if (!militaryRank) {
      throw new EntityNotFoundError("Posto/Graduação");
    }

    await militaryRankRepository.delete(sanitizedId);
  };
}
