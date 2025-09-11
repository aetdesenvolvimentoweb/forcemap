import { LoginService } from "../../../../application/services/auth";
import { makePasswordHasher } from "../../hasher";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeUserRepository,
} from "../../repositories";
import { makeUserCredentialsInputDTOSanitizer } from "../../sanitizers";
import { makeRateLimiterService } from "./rate-limiter.service.factory";
import { makeSessionService } from "./session.service.factory";
import { makeTokenService } from "./token.service.factory";

export const makeLoginService = (): LoginService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const userRepository = makeUserRepository(militaryRepository);
  const sessionService = makeSessionService();
  const tokenService = makeTokenService();
  const userCredentialsInputDTOSanitizer =
    makeUserCredentialsInputDTOSanitizer();
  const passwordHasher = makePasswordHasher();
  const rateLimiter = makeRateLimiterService();

  return new LoginService({
    userRepository,
    militaryRepository,
    sessionService,
    tokenService,
    userCredentialsInputDTOSanitizer,
    passwordHasher,
    rateLimiter,
  });
};
