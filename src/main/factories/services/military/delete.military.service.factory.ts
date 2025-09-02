import { DeleteMilitaryService } from "../../../../application/services";
import { makeMilitaryRepository } from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeMilitaryIdRegisteredValidator,
} from "../../validators";

export const makeDeleteMilitaryService = (): DeleteMilitaryService => {
  const militaryRepository = makeMilitaryRepository();
  const sanitizer = makeIdSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator =
    makeMilitaryIdRegisteredValidator(militaryRepository);

  return new DeleteMilitaryService({
    militaryRepository,
    sanitizer,
    idValidator,
    idRegisteredValidator,
  });
};
