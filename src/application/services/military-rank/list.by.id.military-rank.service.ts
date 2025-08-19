import { EntityNotFoundError } from "@application/errors";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
} from "@application/protocols";

import { MilitaryRank } from "@domain/entities";
import type { MilitaryRankRepository } from "@domain/repositories";
import { ListByIdMilitaryRankUseCase } from "@domain/usecases";

interface ListByIdMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: IdSanitizerProtocol;
  validator: IdValidatorProtocol;
}

export class ListByIdMilitaryRankService
  implements ListByIdMilitaryRankUseCase
{
  constructor(private readonly props: ListByIdMilitaryRankServiceProps) {}

  public readonly listById = async (
    id: string,
  ): Promise<MilitaryRank | null> => {
    const { militaryRankRepository, sanitizer, validator } = this.props;

    const sanitizedId = sanitizer.sanitize(id);
    await validator.validate(sanitizedId);
    const militaryRank = await militaryRankRepository.listById(sanitizedId);

    if (!militaryRank) {
      throw new EntityNotFoundError("Posto/Graduação");
    }

    return militaryRank;
  };
}
