import { UserRepository } from "../../../domain/repositories";
import { DuplicatedKeyError } from "../../errors";
import { UserUniquenessValidatorProtocol } from "../../protocols";
import { ValidationPatterns } from "../common";

export class UserUniquenessValidator
  implements UserUniquenessValidatorProtocol
{
  constructor(private readonly userRepository: UserRepository) {}

  private readonly validateMilitaryIdPresence = (militaryId: string): void => {
    ValidationPatterns.validatePresence(militaryId, "Militar");
  };

  private readonly validateMilitaryIdUniqueness = async (
    militaryId: string,
    idToIgnore?: string,
  ): Promise<void> => {
    const existingUser = await this.userRepository.findByMilitaryId(militaryId);
    if (existingUser && (!idToIgnore || existingUser.id !== idToIgnore)) {
      throw new DuplicatedKeyError("Militar");
    }
  };

  public readonly validate = async (
    militaryId: string,
    idToIgnore?: string,
  ): Promise<void> => {
    this.validateMilitaryIdPresence(militaryId);
    await this.validateMilitaryIdUniqueness(militaryId, idToIgnore);
  };
}
