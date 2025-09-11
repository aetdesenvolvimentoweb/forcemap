import { AuthMiddleware } from "../../../presentation/middlewares/auth.middleware";
import { makeLogger } from "../logger";
import { makeSessionService } from "../services/auth/session.service.factory";
import { makeTokenValidator } from "../validators/auth/token.validator.factory";

export const makeAuthMiddleware = (): AuthMiddleware => {
  const tokenValidator = makeTokenValidator();
  const sessionService = makeSessionService();
  const logger = makeLogger();

  return new AuthMiddleware({
    tokenValidator,
    sessionService,
    logger,
  });
};
