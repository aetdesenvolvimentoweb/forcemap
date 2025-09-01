import { MilitaryRankInputDTOValidatorProtocol } from "../../../../application/protocols";
import { MilitaryRankInputDTOValidator } from "../../../../application/validators";
import { MilitaryRankRepository } from "../../../../domain/repositories";

export const makeMilitaryRankInputDTOValidator = (
  militaryRankRepository: MilitaryRankRepository,
): MilitaryRankInputDTOValidatorProtocol => {
  return new MilitaryRankInputDTOValidator({
    militaryRankRepository,
  });
};
