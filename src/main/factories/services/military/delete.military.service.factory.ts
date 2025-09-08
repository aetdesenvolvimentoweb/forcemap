import { DeleteMilitaryService } from "../../../../application/services";
import { makeMilitaryRepository, makeUserRepository } from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeMilitaryIdRegisteredValidator,
  makeMilitaryInUseValidator,
} from "../../validators";

export const makeDeleteMilitaryService = (): DeleteMilitaryService => {
  const militaryRepository = makeMilitaryRepository();
  const userRepository = makeUserRepository(militaryRepository);
  const sanitizer = makeIdSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator =
    makeMilitaryIdRegisteredValidator(militaryRepository);
  const inUseValidator = makeMilitaryInUseValidator(userRepository);

  return new DeleteMilitaryService({
    militaryRepository,
    sanitizer,
    idValidator,
    idRegisteredValidator,
    inUseValidator,
  });
};
