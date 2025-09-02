import { MilitaryInputDTOValidatorProtocol } from "../../../../application/protocols";
import { MilitaryInputDTOValidator } from "../../../../application/validators";
import { MilitaryRepository } from "../../../../domain/repositories";
import { makeMilitaryRankRepository } from "../../repositories";
import { makeIdValidator } from "../id.validator.factory";

export const makeMilitaryInputDTOValidator = (
  militaryRepository: MilitaryRepository,
): MilitaryInputDTOValidatorProtocol => {
  return new MilitaryInputDTOValidator({
    militaryRepository,
    idValidator: makeIdValidator(),
    militaryRankRepository: makeMilitaryRankRepository(),
  });
};
