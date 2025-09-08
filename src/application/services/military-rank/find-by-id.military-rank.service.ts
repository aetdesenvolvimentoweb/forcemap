import { MilitaryRank } from "../../../domain/entities";
import { MilitaryRankRepository } from "../../../domain/repositories";
import { FindByIdMilitaryRankUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  MilitaryRankIdRegisteredValidatorProtocol,
} from "../../protocols";
import { BaseFindByIdService, BaseFindByIdServiceDeps } from "../common";

interface FindByIdMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: MilitaryRankIdRegisteredValidatorProtocol;
}

export class FindByIdMilitaryRankService
  extends BaseFindByIdService<MilitaryRank>
  implements FindByIdMilitaryRankUseCase
{
  constructor(props: FindByIdMilitaryRankServiceProps) {
    const baseServiceDeps: BaseFindByIdServiceDeps<MilitaryRank> = {
      repository: props.militaryRankRepository,
      idSanitizer: props.sanitizer,
      idValidator: props.idValidator,
      idRegisteredValidator: props.idRegisteredValidator,
    };
    super(baseServiceDeps);
  }
}
