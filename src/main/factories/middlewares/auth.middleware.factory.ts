import { AuthMiddleware } from "../../../presentation/middlewares/auth.middleware";
import { makeLogger } from "../logger";
import { makeSessionService } from "../services/auth/session.service.factory";
import { makeTokenValidationService } from "../services/auth/token-validation.service.factory";

export const makeAuthMiddleware = (): AuthMiddleware => {
  const tokenValidationService = makeTokenValidationService();
  const sessionService = makeSessionService();
  const logger = makeLogger();

  return new AuthMiddleware({
    tokenValidationService,
    sessionService,
    logger,
  });
};
