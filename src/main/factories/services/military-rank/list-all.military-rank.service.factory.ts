import { ListAllMilitaryRankService } from "../../../../application/services";
import { makeMilitaryRankRepository } from "../../repositories";

export const makeListAllMilitaryRankService =
  (): ListAllMilitaryRankService => {
    const militaryRankRepository = makeMilitaryRankRepository();

    return new ListAllMilitaryRankService({
      militaryRankRepository,
    });
  };
