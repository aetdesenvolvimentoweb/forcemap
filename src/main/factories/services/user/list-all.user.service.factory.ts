import { ListAllUserService } from "../../../../application/services";
import { GenericServiceFactory } from "../../common/generic-service.factory";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeUserRepository,
} from "../../repositories";

export const makeListAllUserService = (): ListAllUserService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const userRepository = makeUserRepository(militaryRepository);

  return GenericServiceFactory.listAllService({
    ServiceClass: ListAllUserService,
    repositoryMaker: () => userRepository,
    repositoryKey: "userRepository",
  });
};
