import { MilitaryInputDTO } from "../../../domain/dtos";
import { MilitaryRepository } from "../../../domain/repositories";
import { CreateMilitaryUseCase } from "../../../domain/use-cases";
import {
  MilitaryInputDTOSanitizerProtocol,
  MilitaryInputDTOValidatorProtocol,
} from "../../protocols";

interface CreateMilitaryServiceProps {
  militaryRepository: MilitaryRepository;
  sanitizer: MilitaryInputDTOSanitizerProtocol;
  validator: MilitaryInputDTOValidatorProtocol;
}

export class CreateMilitaryService implements CreateMilitaryUseCase {
  private readonly props: CreateMilitaryServiceProps;

  constructor(props: CreateMilitaryServiceProps) {
    this.props = props;
  }

  public readonly create = async (data: MilitaryInputDTO): Promise<void> => {
    const { militaryRepository, sanitizer, validator } = this.props;

    const sanitizedData = sanitizer.sanitize(data);
    await validator.validate(sanitizedData);
    await militaryRepository.create(sanitizedData);
  };
}
