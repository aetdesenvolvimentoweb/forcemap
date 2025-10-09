import { RefreshTokenService } from "../../../../application/services/auth/refresh-token.service";
import { makeSecurityLogger } from "../../logger";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeSessionRepository,
  makeUserRepository,
} from "../../repositories";
import { makeTokenHandler } from "../../token-handler";

export const makeRefreshTokenService = (): RefreshTokenService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const userRepository = makeUserRepository(militaryRepository);
  const sessionRepository = makeSessionRepository();
  const tokenHandler = makeTokenHandler();
  const securityLogger = makeSecurityLogger();

  return new RefreshTokenService({
    userRepository,
    sessionRepository,
    tokenHandler,
    securityLogger,
  });
};
