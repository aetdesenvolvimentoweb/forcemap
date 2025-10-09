import { LoginService } from "../../../../application/services/auth";
import { makePasswordHasher } from "../../hasher";
import { makeSecurityLogger } from "../../logger";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeUserRepository,
} from "../../repositories";
import { makeUserCredentialsInputDTOSanitizer } from "../../sanitizers";
import { makeRateLimitingService } from "./rate-limiting.service.factory";
import { makeSessionManagementService } from "./session-management.service.factory";

export const makeLoginService = (): LoginService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const userRepository = makeUserRepository(militaryRepository);
  const userCredentialsInputDTOSanitizer =
    makeUserCredentialsInputDTOSanitizer();
  const passwordHasher = makePasswordHasher();
  const rateLimitingService = makeRateLimitingService();
  const sessionManagementService = makeSessionManagementService();
  const securityLogger = makeSecurityLogger();

  return new LoginService({
    userRepository,
    militaryRepository,
    userCredentialsInputDTOSanitizer,
    passwordHasher,
    rateLimitingService,
    sessionManagementService,
    securityLogger,
  });
};
