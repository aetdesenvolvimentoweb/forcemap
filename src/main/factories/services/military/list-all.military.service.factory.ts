import { ListAllMilitaryService } from "../../../../application/services";
import { makeMilitaryRepository } from "../../repositories";

export const makeListAllMilitaryService = (): ListAllMilitaryService => {
  const militaryRepository = makeMilitaryRepository();

  return new ListAllMilitaryService({
    militaryRepository,
  });
};
