import { CreateMilitaryRankService } from "../../../../application/services";
import { makeMilitaryRankRepository } from "../../repositories";
import { makeMilitaryRankInputDTOSanitizer } from "../../sanitizers";
import { makeMilitaryRankInputDTOValidator } from "../../validators";

export const makeCreateMilitaryRankService = (): CreateMilitaryRankService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const sanitizer = makeMilitaryRankInputDTOSanitizer();
  const validator = makeMilitaryRankInputDTOValidator(militaryRankRepository);

  return new CreateMilitaryRankService({
    militaryRankRepository,
    sanitizer,
    validator,
  });
};
