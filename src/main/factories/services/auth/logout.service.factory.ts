import { LogoutService } from "../../../../application/services/auth/logout.service";
import { makeSessionRepository } from "../../repositories";

export const makeLogoutService = (): LogoutService => {
  const sessionRepository = makeSessionRepository();

  return new LogoutService({
    sessionRepository,
  });
};
