import { DeleteMilitaryService } from "../../../../application/services";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeUserRepository,
} from "../../repositories";
import { makeIdSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeMilitaryDeletionPermissionValidator,
  makeMilitaryIdRegisteredValidator,
  makeMilitaryInUseValidator,
} from "../../validators";

export const makeDeleteMilitaryService = (): DeleteMilitaryService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const userRepository = makeUserRepository(militaryRepository);
  const sanitizer = makeIdSanitizer();
  const idValidator = makeIdValidator();
  const idRegisteredValidator =
    makeMilitaryIdRegisteredValidator(militaryRepository);
  const inUseValidator = makeMilitaryInUseValidator(userRepository);
  const deletionPermissionValidator = makeMilitaryDeletionPermissionValidator();

  return new DeleteMilitaryService({
    militaryRepository,
    sanitizer,
    idValidator,
    idRegisteredValidator,
    inUseValidator,
    deletionPermissionValidator,
  });
};
