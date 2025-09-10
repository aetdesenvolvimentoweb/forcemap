import { DeleteMilitaryRankService } from "../../../../application/services";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
} from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeMilitaryRankIdRegisteredValidator,
} from "../../validators";
import { makeMilitaryRankInUseValidator } from "../../validators/military-rank/military-rank.in-use.validator.factory";

export const makeDeleteMilitaryRankService = (): DeleteMilitaryRankService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const sanitizer = makeIdSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator = makeMilitaryRankIdRegisteredValidator(
    militaryRankRepository,
  );
  const inUseValidator = makeMilitaryRankInUseValidator(militaryRepository);

  return new DeleteMilitaryRankService({
    militaryRankRepository,
    sanitizer,
    idValidator,
    idRegisteredValidator,
    inUseValidator,
  });
};
