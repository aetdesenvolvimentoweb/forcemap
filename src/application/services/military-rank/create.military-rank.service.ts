import { MilitaryRankInputDTO } from "../../../domain/dtos";
import { MilitaryRankRepository } from "../../../domain/repositories";
import { CreateMilitaryRankUseCase } from "../../../domain/use-cases";
import {
  MilitaryRankInputDTOSanitizerProtocol,
  MilitaryRankInputDTOValidatorProtocol,
} from "../../protocols";

interface CreateMilitaryRankServiceProps {
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: MilitaryRankInputDTOSanitizerProtocol;
  validator: MilitaryRankInputDTOValidatorProtocol;
}

export class CreateMilitaryRankService implements CreateMilitaryRankUseCase {
  private readonly props: CreateMilitaryRankServiceProps;

  constructor(props: CreateMilitaryRankServiceProps) {
    this.props = props;
  }

  public readonly create = async (
    data: MilitaryRankInputDTO,
  ): Promise<void> => {
    const { militaryRankRepository, sanitizer, validator } = this.props;

    const sanitizedData = sanitizer.sanitize(data);
    await validator.validate(sanitizedData);
    await militaryRankRepository.create(sanitizedData);
  };
}
