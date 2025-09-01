import { FindByIdMilitaryRankService } from "../../../../application/services";
import { makeMilitaryRankRepository } from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeMilitaryRankIdRegisteredValidator,
} from "../../validators";

export const makeFindByIdMilitaryRankService =
  (): FindByIdMilitaryRankService => {
    const militaryRankRepository = makeMilitaryRankRepository();
    const sanitizer = makeIdSanitizer();
    const idValidator = makeIdValidator();
    const idRegisteredValidator = makeMilitaryRankIdRegisteredValidator(
      militaryRankRepository,
    );

    return new FindByIdMilitaryRankService({
      militaryRankRepository,
      sanitizer,
      idValidator,
      idRegisteredValidator,
    });
  };
