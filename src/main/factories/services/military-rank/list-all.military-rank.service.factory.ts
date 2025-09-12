import { ListAllMilitaryRankService } from "../../../../application/services";
import { GenericServiceFactory } from "../../common/generic-service.factory";
import { makeMilitaryRankRepository } from "../../repositories";

export const makeListAllMilitaryRankService =
  (): ListAllMilitaryRankService => {
    return GenericServiceFactory.listAllService({
      ServiceClass: ListAllMilitaryRankService,
      repositoryMaker: makeMilitaryRankRepository,
      repositoryKey: "militaryRankRepository",
    });
  };
