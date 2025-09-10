import { FindByIdMilitaryService } from "../../../../application/services";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
} from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeMilitaryIdRegisteredValidator,
} from "../../validators";

export const makeFindByIdMilitaryService = (): FindByIdMilitaryService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
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
