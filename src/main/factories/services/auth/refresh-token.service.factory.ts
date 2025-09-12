import { RefreshTokenService } from "../../../../application/services/auth/refresh-token.service";
import {
  makeMilitaryRankRepository,
  makeMilitaryRepository,
  makeUserRepository,
} from "../../repositories";
import { makeTokenHandler } from "../../token-handler";
import { makeSessionService } from "./session.service.factory";

export const makeRefreshTokenService = (): RefreshTokenService => {
  const militaryRankRepository = makeMilitaryRankRepository();
  const militaryRepository = makeMilitaryRepository(militaryRankRepository);
  const userRepository = makeUserRepository(militaryRepository);
  const sessionService = makeSessionService();
  const tokenHandler = makeTokenHandler();

  return new RefreshTokenService({
    userRepository,
    sessionService,
    tokenHandler,
  });
};
