import { MilitaryRankInputDTO } from "../../../domain/dtos";
import { MilitaryRankRepository } from "../../../domain/repositories";
import { UpdateMilitaryRankUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  MilitaryRankInputDTOSanitizerProtocol,
  MilitaryRankInputDTOValidatorProtocol,
} from "../../protocols";

interface UpdateMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  idSanitizer: IdSanitizerProtocol;
  dataSanitizer: MilitaryRankInputDTOSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  dataValidator: MilitaryRankInputDTOValidatorProtocol;
}

export class UpdateMilitaryRankService implements UpdateMilitaryRankUseCase {
  private readonly props: UpdateMilitaryRankServiceProps;

  constructor(props: UpdateMilitaryRankServiceProps) {
    this.props = props;
  }

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
    idValidator.validate(sanitizedId);
    const sanitizedData = dataSanitizer.sanitize(data);
    await dataValidator.validate(sanitizedData, sanitizedId);
    await militaryRankRepository.update(sanitizedId, sanitizedData);
  };
}
