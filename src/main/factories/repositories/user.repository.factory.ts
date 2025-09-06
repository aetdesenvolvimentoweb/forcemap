import {
  MilitaryRepository,
  UserRepository,
} from "../../../domain/repositories";
import { UserRepositoryInMemory } from "../../../infra/repositories";

let instance: UserRepositoryInMemory | null = null;

export const makeUserRepository = (
  militaryRepository: MilitaryRepository,
): UserRepository => {
  if (!instance) {
    instance = new UserRepositoryInMemory(militaryRepository);
  }
  return instance;
};
