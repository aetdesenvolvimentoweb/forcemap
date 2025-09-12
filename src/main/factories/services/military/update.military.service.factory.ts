import { UpdateMilitaryService } from "../../../../application/services";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
} from "../../repositories";
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
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);

  // Custom implementation for Update service due to different parameter names
  return new UpdateMilitaryService({
    militaryRepository,
    idSanitizer: makeIdSanitizer(),
    dataSanitizer: makeMilitaryInputDTOSanitizer(),
    idValidator: makeIdValidator(),
    idRegisteredValidator:
      makeMilitaryIdRegisteredValidator(militaryRepository),
    dataValidator: makeMilitaryInputDTOValidator(militaryRepository),
  });
};
