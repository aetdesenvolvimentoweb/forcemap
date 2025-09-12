import { UpdateMilitaryRankService } from "../../../../application/services";
import { makeMilitaryRankRepository } from "../../repositories";
import {
  makeIdSanitizer,
  makeMilitaryRankInputDTOSanitizer,
} from "../../sanitizers";
import {
  makeIdValidator,
  makeMilitaryRankIdRegisteredValidator,
  makeMilitaryRankInputDTOValidator,
} from "../../validators";

export const makeUpdateMilitaryRankService = (): UpdateMilitaryRankService => {
  const militaryRankRepository = makeMilitaryRankRepository();

  // Custom implementation for Update service due to different parameter names
  return new UpdateMilitaryRankService({
    militaryRankRepository,
    idSanitizer: makeIdSanitizer(),
    dataSanitizer: makeMilitaryRankInputDTOSanitizer(),
    idValidator: makeIdValidator(),
    idRegisteredValidator: makeMilitaryRankIdRegisteredValidator(
      militaryRankRepository,
    ),
    dataValidator: makeMilitaryRankInputDTOValidator(militaryRankRepository),
  });
};
