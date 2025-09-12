import { AuthService } from "../../../../application/services/auth/auth.service";
import { makeSessionService } from "./session.service.factory";

export const makeAuthService = (): AuthService => {
  const sessionService = makeSessionService();

  return new AuthService({
    sessionService,
  });
};
