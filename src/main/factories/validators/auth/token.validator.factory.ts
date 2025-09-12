import { TokenValidator } from "../../../../application/validators";
import { makeLogger } from "../../logger";
import { makeSessionRepository } from "../../repositories";
import { makeJWTService } from "../../services/auth";

export const makeTokenValidator = (): TokenValidator => {
  const jwtService = makeJWTService();
  const sessionRepository = makeSessionRepository();
  const logger = makeLogger();

  return new TokenValidator({
    jwtService,
    sessionRepository,
    logger,
  });
};
