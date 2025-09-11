import { AuthService } from "../../../../application/services/auth/auth.service";
import { makeLoginService } from "./login.service.factory";
import { makeSessionService } from "./session.service.factory";

export const makeAuthService = (): AuthService => {
  const loginService = makeLoginService();
  const sessionService = makeSessionService();

  return new AuthService({
    loginService,
    sessionService,
  });
};
