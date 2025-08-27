import { MilitaryRankRepository } from "../../../domain/repositories";
import { MilitaryRankRepositoryInMemory } from "../../../infra/repositories";

export const makeMilitaryRankRepository = (): MilitaryRankRepository => {
  return new MilitaryRankRepositoryInMemory();
};
