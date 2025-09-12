import { MilitaryRepository } from "../../../domain/repositories";
import { EntityNotFoundError } from "../../errors";
import {
  IdValidatorProtocol,
  UserBusinessRulesValidatorProtocol,
} from "../../protocols";

interface UserBusinessRulesValidatorProps {
  militaryRepository: MilitaryRepository;
  idValidator: IdValidatorProtocol;
}

export class UserBusinessRulesValidator
  implements UserBusinessRulesValidatorProtocol
{
  constructor(private readonly props: UserBusinessRulesValidatorProps) {}

  public readonly validate = async (militaryId: string): Promise<void> => {
    const { idValidator, militaryRepository } = this.props;

    idValidator.validate(militaryId);
    const military = await militaryRepository.findById(militaryId);

    if (!military) {
      throw new EntityNotFoundError("Militar");
    }
  };
}
