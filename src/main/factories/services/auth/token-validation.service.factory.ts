import { TokenValidationService } from "../../../../application/services/auth";
import { makeLogger } from "../../logger";
import { makeSessionRepository } from "../../repositories";
import { makeJWTService } from "./jwt.service.factory";

export const makeTokenValidationService = (): TokenValidationService => {
  const jwtService = makeJWTService();
  const sessionRepository = makeSessionRepository();
  const logger = makeLogger();

  return new TokenValidationService({
    jwtService,
    sessionRepository,
    logger,
  });
};
