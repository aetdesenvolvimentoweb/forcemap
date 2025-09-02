import { MilitaryRepository } from "../../../domain/repositories";
import { MilitaryRepositoryInMemory } from "../../../infra/repositories";
import { makeMilitaryRankRepository } from "./military-rank.repository.factory";

let instance: MilitaryRepositoryInMemory | null = null;

export const makeMilitaryRepository = (): MilitaryRepository => {
  if (!instance) {
    const militaryRankRepository = makeMilitaryRankRepository();
    instance = new MilitaryRepositoryInMemory(militaryRankRepository);
  }
  return instance;
};
