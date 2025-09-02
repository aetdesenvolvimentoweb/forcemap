import { CreateMilitaryService } from "../../../../application/services";
import { makeMilitaryRepository } from "../../repositories";
import { makeMilitaryInputDTOSanitizer } from "../../sanitizers";
import { makeMilitaryInputDTOValidator } from "../../validators";

export const makeCreateMilitaryService = (): CreateMilitaryService => {
  const militaryRepository = makeMilitaryRepository();
  const sanitizer = makeMilitaryInputDTOSanitizer();
  const validator = makeMilitaryInputDTOValidator(militaryRepository);

  return new CreateMilitaryService({
    militaryRepository,
    sanitizer,
    validator,
  });
};
