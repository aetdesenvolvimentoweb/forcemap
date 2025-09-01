import { DeleteMilitaryRankService } from "../../../../application/services";
import { makeMilitaryRankRepository } from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeMilitaryRankIdRegisteredValidator,
} from "../../validators";

export const makeDeleteMilitaryRankService = (): DeleteMilitaryRankService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const sanitizer = makeIdSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator = makeMilitaryRankIdRegisteredValidator(
    militaryRankRepository,
  );

  return new DeleteMilitaryRankService({
    militaryRankRepository,
    sanitizer,
    idValidator,
    idRegisteredValidator,
  });
};
