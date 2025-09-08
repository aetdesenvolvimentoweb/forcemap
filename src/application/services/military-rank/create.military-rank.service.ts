import { MilitaryRankInputDTO } from "../../../domain/dtos";
import { MilitaryRankRepository } from "../../../domain/repositories";
import { CreateMilitaryRankUseCase } from "../../../domain/use-cases";
import {
  MilitaryRankInputDTOSanitizerProtocol,
  MilitaryRankInputDTOValidatorProtocol,
} from "../../protocols";
import { BaseCreateService, BaseCreateServiceDeps } from "../common";

interface CreateMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: MilitaryRankInputDTOSanitizerProtocol;
  validator: MilitaryRankInputDTOValidatorProtocol;
}

export class CreateMilitaryRankService
  extends BaseCreateService<MilitaryRankInputDTO>
  implements CreateMilitaryRankUseCase
{
  constructor(props: CreateMilitaryRankServiceProps) {
    const baseServiceDeps: BaseCreateServiceDeps<MilitaryRankInputDTO> = {
      repository: props.militaryRankRepository,
      sanitizer: props.sanitizer,
      validator: props.validator,
    };
    super(baseServiceDeps);
  }
}
