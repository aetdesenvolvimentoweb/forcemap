import { MilitaryRankInUseValidatorProtocol } from "../../../../application/protocols";
import { MilitaryRankInUseValidator } from "../../../../application/validators";
import { MilitaryRepository } from "../../../../domain/repositories";

export const makeMilitaryRankInUseValidator = (
  militaryRepository: MilitaryRepository,
): MilitaryRankInUseValidatorProtocol => {
  return new MilitaryRankInUseValidator({
    militaryRepository,
  });
};
