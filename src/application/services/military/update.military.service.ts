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
import { BaseUpdateService, BaseUpdateServiceDeps } from "../common";

interface UpdateMilitaryServiceProps {
  militaryRepository: MilitaryRepository;
  idSanitizer: IdSanitizerProtocol;
  dataSanitizer: MilitaryInputDTOSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: MilitaryIdRegisteredValidatorProtocol;
  dataValidator: MilitaryInputDTOValidatorProtocol;
}

export class UpdateMilitaryService
  extends BaseUpdateService<MilitaryInputDTO>
  implements UpdateMilitaryUseCase
{
  constructor(props: UpdateMilitaryServiceProps) {
    const baseServiceDeps: BaseUpdateServiceDeps = {
      repository: props.militaryRepository,
      idSanitizer: props.idSanitizer,
      dataSanitizer: props.dataSanitizer,
      idValidator: props.idValidator,
      idRegisteredValidator: props.idRegisteredValidator,
      dataValidator: props.dataValidator,
    };
    super(baseServiceDeps);
  }
}
