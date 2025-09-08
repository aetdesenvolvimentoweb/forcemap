import { MilitaryRankInputDTO } from "../../../domain/dtos";
import { MilitaryRankRepository } from "../../../domain/repositories";
import { UpdateMilitaryRankUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  MilitaryRankIdRegisteredValidatorProtocol,
  MilitaryRankInputDTOSanitizerProtocol,
  MilitaryRankInputDTOValidatorProtocol,
} from "../../protocols";
import { BaseUpdateService, BaseUpdateServiceDeps } from "../common";

interface UpdateMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  idSanitizer: IdSanitizerProtocol;
  dataSanitizer: MilitaryRankInputDTOSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: MilitaryRankIdRegisteredValidatorProtocol;
  dataValidator: MilitaryRankInputDTOValidatorProtocol;
}

export class UpdateMilitaryRankService
  extends BaseUpdateService<MilitaryRankInputDTO>
  implements UpdateMilitaryRankUseCase
{
  constructor(props: UpdateMilitaryRankServiceProps) {
    const baseServiceDeps: BaseUpdateServiceDeps<MilitaryRankInputDTO> = {
      repository: props.militaryRankRepository,
      idSanitizer: props.idSanitizer,
      dataSanitizer: props.dataSanitizer,
      idValidator: props.idValidator,
      idRegisteredValidator: props.idRegisteredValidator,
      dataValidator: props.dataValidator,
    };
    super(baseServiceDeps);
  }
}
