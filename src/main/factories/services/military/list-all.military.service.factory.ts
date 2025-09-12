import { ListAllMilitaryService } from "../../../../application/services";
import { GenericServiceFactory } from "../../common/generic-service.factory";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
} from "../../repositories";

export const makeListAllMilitaryService = (): ListAllMilitaryService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);

  return GenericServiceFactory.listAllService({
    ServiceClass: ListAllMilitaryService,
    repositoryMaker: () => militaryRepository,
    repositoryKey: "militaryRepository",
  });
};
