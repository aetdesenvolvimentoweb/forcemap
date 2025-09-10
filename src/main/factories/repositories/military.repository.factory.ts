import {
  MilitaryRankRepository,
  MilitaryRepository,
} from "../../../domain/repositories";
import { MilitaryRepositoryInMemory } from "../../../infra/repositories";

let instance: MilitaryRepositoryInMemory | null = null;

export const makeMilitaryRepository = (
  militaryRankRepository: MilitaryRankRepository,
): MilitaryRepository => {
  if (!instance) {
    instance = new MilitaryRepositoryInMemory(militaryRankRepository);
  }
  return instance;
};
