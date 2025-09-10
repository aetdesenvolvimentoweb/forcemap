import { AuthMiddleware } from "../../../presentation/middlewares/auth.middleware";
import { makeLogger } from "../logger";
import { makeSessionRepository } from "../repositories";
import { makeJWTService } from "../services/auth/jwt.service.factory";

export const makeAuthMiddleware = (): AuthMiddleware => {
  const jwtService = makeJWTService();
  const sessionRepository = makeSessionRepository();
  const logger = makeLogger();

  return new AuthMiddleware({
    jwtService,
    sessionRepository,
    logger,
  });
};
