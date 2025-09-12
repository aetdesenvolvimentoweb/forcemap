import { LoginService } from "../../../../application/services/auth";
import { makePasswordHasher } from "../../hasher";
import { makeRateLimiter } from "../../rate-limiter";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeUserRepository,
} from "../../repositories";
import { makeUserCredentialsInputDTOSanitizer } from "../../sanitizers";
import { makeTokenHandler } from "../../token-handler";
import { makeSessionService } from "./session.service.factory";

export const makeLoginService = (): LoginService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const userRepository = makeUserRepository(militaryRepository);
  const sessionService = makeSessionService();
  const tokenHandler = makeTokenHandler();
  const userCredentialsInputDTOSanitizer =
    makeUserCredentialsInputDTOSanitizer();
  const passwordHasher = makePasswordHasher();
  const rateLimiter = makeRateLimiter();

  return new LoginService({
    userRepository,
    militaryRepository,
    sessionService,
    tokenHandler,
    userCredentialsInputDTOSanitizer,
    passwordHasher,
    rateLimiter,
  });
};
