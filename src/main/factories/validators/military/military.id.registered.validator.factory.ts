import { MilitaryIdRegisteredValidatorProtocol } from "../../../../application/protocols";
import { MilitaryIdRegisteredValidator } from "../../../../application/validators";
import { MilitaryRepository } from "../../../../domain/repositories";

export const makeMilitaryIdRegisteredValidator = (
  militaryRepository: MilitaryRepository,
): MilitaryIdRegisteredValidatorProtocol => {
  return new MilitaryIdRegisteredValidator({
    militaryRepository,
  });
};
