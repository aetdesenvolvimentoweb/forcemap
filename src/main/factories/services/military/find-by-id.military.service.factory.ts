import { FindByIdMilitaryService } from "../../../../application/services";
import { makeMilitaryRepository } from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeMilitaryIdRegisteredValidator,
} from "../../validators";

export const makeFindByIdMilitaryService = (): FindByIdMilitaryService => {
  const militaryRepository = makeMilitaryRepository();
  const sanitizer = makeIdSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator =
    makeMilitaryIdRegisteredValidator(militaryRepository);

  return new FindByIdMilitaryService({
    militaryRepository,
    sanitizer,
    idValidator,
    idRegisteredValidator,
  });
};
