import { UpdateMilitaryService } from "../../../../application/services";
import { makeMilitaryRepository } from "../../repositories";
import {
  makeIdSanitizer,
  makeMilitaryInputDTOSanitizer,
} from "../../sanitizers";
import {
  makeIdValidator,
  makeMilitaryIdRegisteredValidator,
  makeMilitaryInputDTOValidator,
} from "../../validators";

export const makeUpdateMilitaryService = (): UpdateMilitaryService => {
  const militaryRepository = makeMilitaryRepository();
  const idSanitizer = makeIdSanitizer();
  const dataSanitizer = makeMilitaryInputDTOSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator =
    makeMilitaryIdRegisteredValidator(militaryRepository);
  const dataValidator = makeMilitaryInputDTOValidator(militaryRepository);

  return new UpdateMilitaryService({
    militaryRepository,
    idSanitizer,
    dataSanitizer,
    idValidator,
    idRegisteredValidator,
    dataValidator,
  });
};
