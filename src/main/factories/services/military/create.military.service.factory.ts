import { CreateMilitaryService } from "../../../../application/services";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
} from "../../repositories";
import { makeMilitaryInputDTOSanitizer } from "../../sanitizers";
import { makeMilitaryInputDTOValidator } from "../../validators";

export const makeCreateMilitaryService = (): CreateMilitaryService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const sanitizer = makeMilitaryInputDTOSanitizer();
  const validator = makeMilitaryInputDTOValidator(militaryRepository);

  return new CreateMilitaryService({
    militaryRepository,
    sanitizer,
    validator,
  });
};
