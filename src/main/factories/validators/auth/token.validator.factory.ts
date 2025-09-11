import { TokenValidator } from "../../../../application/validators/auth/token.validator";
import { makeLogger } from "../../logger";
import { makeSessionRepository } from "../../repositories";
import { makeJWTService } from "../../services/auth/jwt.service.factory";

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
