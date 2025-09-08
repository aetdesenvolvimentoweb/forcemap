import { MilitaryInputDTO } from "../../../domain/dtos";
import { MilitaryRepository } from "../../../domain/repositories";
import { CreateMilitaryUseCase } from "../../../domain/use-cases";
import {
  MilitaryInputDTOSanitizerProtocol,
  MilitaryInputDTOValidatorProtocol,
} from "../../protocols";
import { BaseCreateService, BaseCreateServiceDeps } from "../common";

interface CreateMilitaryServiceProps {
  militaryRepository: MilitaryRepository;
  sanitizer: MilitaryInputDTOSanitizerProtocol;
  validator: MilitaryInputDTOValidatorProtocol;
}

export class CreateMilitaryService
  extends BaseCreateService<MilitaryInputDTO>
  implements CreateMilitaryUseCase
{
  constructor(props: CreateMilitaryServiceProps) {
    const baseServiceDeps: BaseCreateServiceDeps<
      MilitaryInputDTOSanitizerProtocol,
      MilitaryInputDTOValidatorProtocol,
      MilitaryRepository
    > = {
      repository: props.militaryRepository,
      sanitizer: props.sanitizer,
      validator: props.validator,
    };
    super(baseServiceDeps);
  }
}
