import { ListAllMilitaryService } from "../../../../application/services";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
} from "../../repositories";

export const makeListAllMilitaryService = (): ListAllMilitaryService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);

  return new ListAllMilitaryService({
    militaryRepository,
  });
};
