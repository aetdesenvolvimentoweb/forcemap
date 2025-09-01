import { MilitaryRepository } from "../../../domain/repositories";
import { EntityNotFoundError } from "../../errors";
import { MilitaryIdRegisteredValidatorProtocol } from "../../protocols";

interface MilitaryIdRegisteredValidatorProps {
  militaryRepository: MilitaryRepository;
}

export class MilitaryIdRegisteredValidator
  implements MilitaryIdRegisteredValidatorProtocol
{
  constructor(private readonly props: MilitaryIdRegisteredValidatorProps) {}

  validate = async (id: string): Promise<void> => {
    const { militaryRepository } = this.props;
    const military = await militaryRepository.findById(id);

    if (!military) {
      throw new EntityNotFoundError("Militar");
    }
  };
}
