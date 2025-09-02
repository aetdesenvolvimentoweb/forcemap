import { MilitaryInputDTO } from "../../../domain/dtos";
import { MilitaryRepository } from "../../../domain/repositories";
import { UpdateMilitaryUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  MilitaryIdRegisteredValidatorProtocol,
  MilitaryInputDTOSanitizerProtocol,
  MilitaryInputDTOValidatorProtocol,
} from "../../protocols";

interface UpdateMilitaryServiceProps {
  militaryRepository: MilitaryRepository;
  idSanitizer: IdSanitizerProtocol;
  dataSanitizer: MilitaryInputDTOSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: MilitaryIdRegisteredValidatorProtocol;
  dataValidator: MilitaryInputDTOValidatorProtocol;
}

export class UpdateMilitaryService implements UpdateMilitaryUseCase {
  private readonly props: UpdateMilitaryServiceProps;

  constructor(props: UpdateMilitaryServiceProps) {
    this.props = props;
  }

  public readonly update = async (
    id: string,
    data: MilitaryInputDTO,
  ): Promise<void> => {
    const {
      militaryRepository,
      idSanitizer,
      dataSanitizer,
      idValidator,
      idRegisteredValidator,
      dataValidator,
    } = this.props;

    const sanitizedId = idSanitizer.sanitize(id);
    idValidator.validate(sanitizedId);
    idRegisteredValidator.validate(sanitizedId);
    const sanitizedData = dataSanitizer.sanitize(data);
    await dataValidator.validate(sanitizedData, sanitizedId);
    await militaryRepository.update(sanitizedId, sanitizedData);
  };
}
