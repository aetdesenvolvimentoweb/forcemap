import type {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  MilitaryRankInputDTOSanitizerProtocol,
  MilitaryRankValidatorProtocol,
} from "@application/protocols";

import type { MilitaryRankInputDTO } from "@domain/dtos";
import type { MilitaryRankRepository } from "@domain/repositories";
import type { UpdateMilitaryRankUseCase } from "@domain/usecases";

interface UpdateMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  idSanitizer: IdSanitizerProtocol;
  dataSanitizer: MilitaryRankInputDTOSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  dataValidator: MilitaryRankValidatorProtocol;
}

export class UpdateMilitaryRankService implements UpdateMilitaryRankUseCase {
  constructor(private readonly props: UpdateMilitaryRankServiceProps) {}

  public readonly update = async (
    id: string,
    data: MilitaryRankInputDTO,
  ): Promise<void> => {
    const {
      militaryRankRepository,
      idSanitizer,
      dataSanitizer,
      idValidator,
      dataValidator,
    } = this.props;

    const sanitizedId = idSanitizer.sanitize(id);
    const sanitizedData = dataSanitizer.sanitize(data);
    await idValidator.validate(sanitizedId);
    await dataValidator.validate(sanitizedData, sanitizedId);
    await militaryRankRepository.update(sanitizedId, sanitizedData);
  };
}
