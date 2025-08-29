import { ListAllMilitaryRankService } from "../../../../application/services";
import { ListAllMilitaryRankUseCase } from "../../../../domain/use-cases";
import { makeMilitaryRankRepository } from "../../repositories";

export const makeListAllMilitaryRankUseCase =
  (): ListAllMilitaryRankUseCase => {
    const militaryRankRepository = makeMilitaryRankRepository();

    return new ListAllMilitaryRankService({
      militaryRankRepository,
    });
  };
