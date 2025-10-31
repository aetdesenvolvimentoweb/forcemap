import { LogoutService } from "../../../../application/services/auth/logout.service";
import { makeSecurityLogger } from "../../logger";
import { makeSessionRepository } from "../../repositories";

export const makeLogoutService = (): LogoutService => {
  const sessionRepository = makeSessionRepository();
  const securityLogger = makeSecurityLogger();

  return new LogoutService({
    sessionRepository,
    securityLogger,
  });
};
