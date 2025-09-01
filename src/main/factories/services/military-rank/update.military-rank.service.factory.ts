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
  const idSanitizer = makeIdSanitizer();
  const dataSanitizer = makeMilitaryRankInputDTOSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator = makeMilitaryRankIdRegisteredValidator(
    militaryRankRepository,
  );
  const dataValidator = makeMilitaryRankInputDTOValidator(
    militaryRankRepository,
  );

  return new UpdateMilitaryRankService({
    militaryRankRepository,
    idSanitizer,
    dataSanitizer,
    idValidator,
    idRegisteredValidator,
    dataValidator,
  });
};
