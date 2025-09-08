import { MilitaryOutputDTO } from "../../../domain/dtos";
import { MilitaryRepository } from "../../../domain/repositories";
import { FindByIdMilitaryUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  MilitaryIdRegisteredValidatorProtocol,
} from "../../protocols";
import { BaseFindByIdService, BaseFindByIdServiceDeps } from "../common";

interface FindByIdMilitaryServiceProps {
  militaryRepository: MilitaryRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: MilitaryIdRegisteredValidatorProtocol;
}

export class FindByIdMilitaryService
  extends BaseFindByIdService<MilitaryOutputDTO>
  implements FindByIdMilitaryUseCase
{
  constructor(props: FindByIdMilitaryServiceProps) {
    const baseServiceDeps: BaseFindByIdServiceDeps<MilitaryOutputDTO> = {
      repository: props.militaryRepository,
      idSanitizer: props.sanitizer,
      idValidator: props.idValidator,
      idRegisteredValidator: props.idRegisteredValidator,
    };
    super(baseServiceDeps);
  }
}
