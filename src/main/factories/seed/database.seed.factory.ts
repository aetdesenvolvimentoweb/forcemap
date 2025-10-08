import { DatabaseSeed } from "../../seed/database.seed";
import { makePasswordHasher } from "../hasher/password.hasher.factory";
import { makeGlobalLogger } from "../logger/global-logger.factory";
import { makeMilitaryRepository } from "../repositories/military.repository.factory";
import { makeMilitaryRankRepository } from "../repositories/military-rank.repository.factory";
import { makeUserRepository } from "../repositories/user.repository.factory";

export const makeDatabaseSeed = (): DatabaseSeed => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const userRepository = makeUserRepository(militaryRepository);
  const passwordHasher = makePasswordHasher();
  const logger = makeGlobalLogger();

  return new DatabaseSeed(
    militaryRankRepository,
    militaryRepository,
    userRepository,
    passwordHasher,
    logger,
  );
};
