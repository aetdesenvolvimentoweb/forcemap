import { UpdateUserService } from "../../../../application/services";
import { makeMilitaryRepository, makeUserRepository } from "../../repositories";
import { makeIdSanitizer, makeUserInputDTOSanitizer } from "../../sanitizers";
import {
  makeIdValidator,
  makeUserIdRegisteredValidator,
  makeUserInputDTOValidator,
} from "../../validators";

export const makeUpdateUserService = (): UpdateUserService => {
  const militaryRepository = makeMilitaryRepository();
  const userRepository = makeUserRepository(militaryRepository);
  const idSanitizer = makeIdSanitizer();
  const dataSanitizer = makeUserInputDTOSanitizer(idSanitizer);
  const idValidator = makeIdValidator();
  const idRegisteredValidator = makeUserIdRegisteredValidator(userRepository);
  const dataValidator = makeUserInputDTOValidator(
    userRepository,
    idValidator,
    militaryRepository,
  );

  return new UpdateUserService({
    userRepository,
    idSanitizer,
    dataSanitizer,
    idValidator,
    idRegisteredValidator,
    dataValidator,
  });
};
