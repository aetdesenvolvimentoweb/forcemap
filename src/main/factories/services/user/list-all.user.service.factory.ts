import { ListAllUserService } from "../../../../application/services";
import { makeMilitaryRepository, makeUserRepository } from "../../repositories";

export const makeListAllUserService = (): ListAllUserService => {
  const militaryRepository = makeMilitaryRepository();
  const userRepository = makeUserRepository(militaryRepository);

  return new ListAllUserService({
    userRepository,
  });
};
