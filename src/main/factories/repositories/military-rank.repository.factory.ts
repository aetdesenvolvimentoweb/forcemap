import { MilitaryRankRepository } from "src/domain/repositories";
import { MilitaryRankRepositoryInMemory } from "src/infra/repositories";

export const makeMilitaryRankRepository = (): MilitaryRankRepository => {
  return new MilitaryRankRepositoryInMemory();
};
