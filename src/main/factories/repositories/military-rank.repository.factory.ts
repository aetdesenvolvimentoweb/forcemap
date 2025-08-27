import { MilitaryRankRepository } from "../../../domain/repositories";
import { MilitaryRankRepositoryInMemory } from "../../../infra/repositories";

let instance: MilitaryRankRepositoryInMemory | null = null;

export const makeMilitaryRankRepository = (): MilitaryRankRepository => {
  if (!instance) {
    instance = new MilitaryRankRepositoryInMemory();
  }
  return instance;
};
