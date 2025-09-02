import { MilitaryOutputDTO } from "src/domain/dtos";

import { MilitaryRepository } from "../../../domain/repositories";
import { FindByIdMilitaryUseCase } from "../../../domain/use-cases";
import {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  MilitaryIdRegisteredValidatorProtocol,
} from "../../protocols";

interface FindByIdMilitaryServiceProps {
  militaryRepository: MilitaryRepository;
  sanitizer: IdSanitizerProtocol;
  idValidator: IdValidatorProtocol;
  idRegisteredValidator: MilitaryIdRegisteredValidatorProtocol;
}

export class FindByIdMilitaryService implements FindByIdMilitaryUseCase {
  private readonly props: FindByIdMilitaryServiceProps;

  constructor(props: FindByIdMilitaryServiceProps) {
    this.props = props;
  }

  public readonly findById = async (
    id: string,
  ): Promise<MilitaryOutputDTO | null> => {
    const {
      militaryRepository,
      sanitizer,
      idValidator,
      idRegisteredValidator,
    } = this.props;

    const sanitizedId = sanitizer.sanitize(id);
    idValidator.validate(sanitizedId);
    idRegisteredValidator.validate(sanitizedId);
    const military = await militaryRepository.findById(sanitizedId);
    return military;
  };
}
