import { MilitaryDeletionPermissionValidator } from "../../../../application/validators";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeUserRepository,
} from "../../repositories";

export const makeMilitaryDeletionPermissionValidator = () => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const userRepository = makeUserRepository(militaryRepository);

  return new MilitaryDeletionPermissionValidator({
    userRepository,
  });
};
