import { LogoutService } from "../../../../application/services/auth/logout.service";
import { makeSessionService } from "./session.service.factory";

export const makeLogoutService = (): LogoutService => {
  const sessionService = makeSessionService();

  return new LogoutService({
    sessionService,
  });
};
